from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import PlaceImage


@receiver(pre_delete, sender=PlaceImage)
def delete_place_image_file(sender, instance, **kwargs):
    if instance.image:
        instance.image.delete(save=False)
