from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


class Place(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="places",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def get_thumbnail(self):
        """Return the image marked as thumbnail"""
        return self.images.filter(is_thumbnail=True).first()

    def get_images(self):
        """Return all images associated with a specific place...used in carousel"""
        return self.images.all()


def place_image_path(instance, filename):
    return f"place_pics/{instance.place.id}/{filename}"


def validate_image_size(image):
    max_size = settings.MAX_IMAGE_UPLOAD_SIZE
    if image.size > max_size:
        raise ValidationError("Image size should not exceed 5MB.")


class PlaceImage(models.Model):
    """
    Represents an image associated with a specific place. One image/place marked as thumbnail.
    """

    place = models.ForeignKey(Place, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to=place_image_path,
        validators=[
            FileExtensionValidator(["jpg", "jpeg", "png"]),
            validate_image_size,
        ],
    )
    is_thumbnail = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def save(self, *args, **kwargs):
        if self.is_thumbnail:
            PlaceImage.objects.filter(place=self.place).exclude(pk=self.pk).update(
                is_thumbnail=False
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.place.name} - Image {self.order}"
