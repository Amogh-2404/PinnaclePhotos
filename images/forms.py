from django import forms
from .models import Image
import requests
from django.core.files.base import ContentFile
from django.utils.text import slugify
import os
from urllib.parse import urlparse


class ImageCreateForm(forms.ModelForm):
    class Meta:
        model = Image
        fields = ['title', 'url', 'description']
        widgets = {
            'url': forms.HiddenInput,
        }

    def clean_url(self):
        url = self.cleaned_data['url']
        valid_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        # Parse the URL and derive extension from the path only (ignore query/fragment)
        path = urlparse(url).path
        _, ext = os.path.splitext(path)
        extension = ext.lower().lstrip('.')
        # If there is an extension and it's not valid, reject; otherwise allow and validate by content-type later
        if extension and extension not in valid_extensions:
            raise forms.ValidationError(
                'The given URL does not match valid image extensions (jpg, jpeg, png, gif, webp).'
            )
        return url

    def save(self, force_insert=False, force_update=False, commit=True):
        image = super().save(commit=False)
        image_url = self.cleaned_data['url']
        name = slugify(image.title)
        # Download image robustly and validate content-type
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
        }
        resp = requests.get(image_url, stream=True, headers=headers, timeout=10)
        resp.raise_for_status()
        content_type = (resp.headers.get('Content-Type') or '').lower()

        # Determine extension (prefer response content-type, fallback to URL path)
        path = urlparse(image_url).path
        _, ext = os.path.splitext(path)
        extension = (ext.lower().lstrip('.') or '').strip()
        if not extension:
            if 'jpeg' in content_type:
                extension = 'jpg'
            elif 'png' in content_type:
                extension = 'png'
            elif 'gif' in content_type:
                extension = 'gif'
            elif 'webp' in content_type:
                extension = 'webp'
            else:
                extension = 'jpg'

        # Ensure we received an image
        if not content_type.startswith('image/') and extension not in {'jpg', 'jpeg', 'png', 'gif', 'webp'}:
            raise ValueError('Provided URL did not return an image')

        image_name = f'{name}.{extension}'
        content = resp.content
        image.image.save(image_name, ContentFile(content), save=False)
        if commit:
            image.save()
        return image
