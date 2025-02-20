from django.db import models
from django.contrib.auth.models import User





class Sheet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')

    def __str__(self):
        return f"{self.user}"


class CellData(models.Model):
    row_id = models.IntegerField()
    col_id = models.IntegerField()
    value = models.TextField()

    def __str__(self):
        return f"Row: {self.row_id}, Column: {self.col_id}, Value: {self.value}"