from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Activate all users'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            print(user)
            user.is_active = True
            user.save()
        self.stdout.write(self.style.SUCCESS('Successfully activated all users'))
