---
date: "{{ .Date }}"
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
description: '{{ replace .File.ContentBaseName "-" " " | title }}'
draft: true
---