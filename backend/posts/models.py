from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import (
    FileExtensionValidator,
    MinValueValidator,
    MaxValueValidator,
)


class Place(models.Model):
    name = models.CharField(max_length=50)
    subtitle = models.CharField(max_length=100)
    description = models.TextField()
    longitude = models.FloatField(
        validators=[
            MinValueValidator(-180, message="Longitude must be at least -180."),
            MaxValueValidator(180, message="Longitude must not exceed 180."),
        ]
    )
    latitude = models.FloatField(
        validators=[
            MinValueValidator(-90, message="Latitude must be at least -90."),
            MaxValueValidator(90, message="Latitude must not exceed 90."),
        ]
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="places",
    )
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[
            MinValueValidator(0.0, message="Rating must be at least 0."),
            MaxValueValidator(5.0, message="Rating must not exceed 5."),
        ],
        null=True,
        blank=True,
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
    caption = models.CharField(max_length=100, blank=True)
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
