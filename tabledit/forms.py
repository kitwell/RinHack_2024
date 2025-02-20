from django import forms
from django.contrib.auth.models import User
from .models import *

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput())


class RegisterForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].required = True
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'shape'

    class Meta:
        model = User
        fields = ('username', 'last_name', 'email', 'password')
        widgets = {'password': forms.PasswordInput()}


class UploadSheetForm(forms.ModelForm):
    class Meta:
        model = Sheet
        fields = ['file']