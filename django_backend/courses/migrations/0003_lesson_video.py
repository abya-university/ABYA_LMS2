# Generated by Django 5.0 on 2024-06-16 19:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_chapter_chapter_quiz'),
        ('resources', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='video',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='video', to='resources.videolesson'),
        ),
    ]
