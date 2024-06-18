import urllib
from django import template
from django.core.files.base import ContentFile
from easy_thumbnails.files import get_thumbnailer

register = template.Library()

@register.simple_tag
def url_thumbnail(image_url, size):
    try:
        # Download the image
        response = urllib.request.urlopen(image_url)
        image_content = response.read()

        # Save image to ContentFile
        image_file = ContentFile(image_content)
        image_file.name = 'temp_image.jpg'  # Give it a name

        # Create thumbnail
        thumbnailer = get_thumbnailer(image_file)
        thumbnail = thumbnailer.get_thumbnail({
            'size': size.split('x'),
            'crop': True,
            'upscale': True,
        })
        return thumbnail.url
    except Exception as e:
        return ''
