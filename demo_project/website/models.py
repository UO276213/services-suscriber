from django.db import models

# Create your models here.

class Subscription(models.Model):
    end_point = models.CharField(primary_key=True, max_length=60)
    expiration_time = models.DateTimeField(blank=True, null=True)
    auth_key = models.CharField(max_length=15)
    #  client public key / p256dh 
    subscription_pkey = models.CharField( max_length=60)
