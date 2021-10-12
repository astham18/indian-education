# https://gist.github.com/anilnairxyz/11190f144a89b54c6698699f3a83b315
# https://plnkr.co/edit/m0COuITsooSrhW5DxkMf?p=preview&preview

import json
import random

with open('docs/IND_adm2_Literacy.json', 'r+') as f:
    data = json.load(f)
    for i in range(len(data['objects']['IND_adm2']['geometries'])):
        data['objects']['IND_adm2']['geometries'][i]['properties']['dummy'] = random.randint(1, 100)
    f.seek(0)
    json.dump(data, f, indent=4)

# To add new button,
# Update json
# Update radio button list
