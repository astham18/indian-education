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

with open('docs/IND_adm2_Literacy.json', 'r+') as f:
    data = json.load(f)
    for y in range(len(data['objects']['IND_adm2']['geometries'])):
        data_obj = data['objects']['IND_adm2']['geometries'][y]
        data_id = data_obj['id'].lower()
        for i in range(len(NUM_SCHOOLS)):
            district = NUM_SCHOOLS[i]['district'].lower()
            if data_id == district:
                data['objects']['IND_adm2']['geometries'][y]['properties']['Num_Schools'] = NUM_SCHOOLS[i]['num_schools']
            if i == len(NUM_SCHOOLS) - 1:
                data['objects']['IND_adm2']['geometries'][y]['properties']['Num_Schools'] = 0
    f.seek(0)
    json.dump(data, f, indent=4)

# To add new button,
# Update json
# Update radio button list
