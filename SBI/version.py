#!/usr/bin/python
import json
with open('package.json') as file:
    data = json.load(file)
    print(data['version'])
