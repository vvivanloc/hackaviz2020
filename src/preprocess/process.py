import json

#path = ''
path = '../../'

# process per town data
# ---------------------

# strip out town countouring, keep only town with intra hour non null & sort by employment
with open(path+'maps/par_commune.geojson') as json_file:  
    townsIn = json.load(json_file)
    townsOut= []
    i=0
    for p in townsIn['features']:
        i=i+1
        # filter
        if (p['properties']['2014_intra_heure']!=None):
            rowOut=p['properties']
            # fix INSEE type
            rowOut['INSEE_COM']=int(rowOut['INSEE_COM'])
            # income per month
            rowOut['revenu_median']=int(rowOut['revenu_median'])/ 12
            townsOut.append(rowOut)

# sort
townsOut=sorted(townsOut, key = lambda town: town['emplois'],reverse=True) 

with open(path+'maps/par_commune.js', 'w') as outfile:  
    outfile.writelines('const par_commune = ')
    json.dump(townsOut, outfile)    
print  ('towns: read %s -> write %s'% (i,len(townsOut)))

# extract town
town_insee_codes = set()

for town in townsOut:
    town_insee_codes.add(town['INSEE_COM'])

# process per arc
# ---------------
import csv
with open(path+'maps/par_trajet.csv', 'r') as csvfile:
    arcsIn = csv.DictReader(csvfile, delimiter=',')
    arcsOut=[]
    i=0
    for row in arcsIn:
        i=i+1
         # fix INSEE type
        row['insee']=int(row['insee'])
        row['travail_insee']=int(row['travail_insee'])
        if (row['insee'] in town_insee_codes) and (row['travail_insee'] in town_insee_codes):
            rowOut=row
            for prop in rowOut:
                # fix CSV to string conversion
                if prop != 'commune' and prop != 'travail_commune' and prop != 'insee' and prop != 'travail_insee':
                    rowOut[prop]=float(rowOut[prop])
                
            # exchange lat lon due to error
            rowOut['latitude'],rowOut['longitude'] = rowOut['longitude'],rowOut['latitude']
            rowOut['travail_latitude'],rowOut['travail_longitude'] = rowOut['travail_longitude'],rowOut['travail_latitude']
            
            arcsOut.append(rowOut)

arcsOut=sorted(arcsOut, key = lambda arcOut: arcOut['insee']) 

# export arcs
with open(path+'maps/par_trajet.js', 'w') as outfile:  
    outfile.writelines('const par_trajet = ')
    json.dump(arcsOut, outfile)    

print ('arcs: read %s -> write %s'% (i,len(arcsOut)))
