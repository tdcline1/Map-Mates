from django.contrib.auth import get_user_model
import factory

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Factory Boy factory class for creating User instances"""

    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"testuser{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
