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
        if extension not in valid_extensions:
            raise forms.ValidationError(
                'The given URL does not match valid image extensions (jpg, jpeg, png, gif, webp).'
            )
        return url

    def save(self, force_insert=False, force_update=False, commit=True):
        image = super().save(commit=False)
        image_url = self.cleaned_data['url']
        name = slugify(image.title)
        # Derive extension from URL path to avoid query/fragment noise
        path = urlparse(image_url).path
        _, ext = os.path.splitext(path)
        extension = ext.lower().lstrip('.')
        image_name = f'{name}.{extension}'
        # Download image from the given URL
        response = requests.get(image_url)
        image.image.save(
            image_name,
            ContentFile(response.content),
            save=False
        )
        if commit:
            image.save()
        return image
