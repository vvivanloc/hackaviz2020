#!/usr/bin/python3
# coding=UTF-8
import json

#path = ''
path = '../data'

# 21/01/2018 -> 2018-01-21
def dateToISO(dateStrFr):
    dateArr=dateStrFr.split('/')
    return dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0]



import csv
with open(path+'/par_origines_trie.csv', 'r') as csvfile:
    fileIn = csv.DictReader(csvfile, delimiter=',')
    fileOuts={}
    i=0
    sumVolume=0
    previousDate=''
    previousDest=''
    outDest=''

    firstInit=True
     
    for rowIn in fileIn:
        i = i + 1
        #rowIn['travail_insee']=int(rowIn['travail_insee'])

        if (firstInit):
            previousDate = rowIn['date']
            previousDest = rowIn['dest']
            
            rowOut={}
            rowOut['date']=dateToISO(rowIn['date'])
            #rowOut['dest']=rowIn['dest']
            outDest = rowIn['dest']
            firstInit = False

        
        #detect break        
        if (rowIn['date']!=previousDate) or (rowIn['dest']!=previousDest):            
            rowOut['nuitées'] = sumVolume
            
            if not outDest in fileOuts:
                fileOuts[outDest]=[]

            if sumVolume==0:
                print('ignore null volume data for date:'+rowOut['date']+' dep:'+outDest)
            else:
                if rowIn['date']!=previousDate:
                    print(rowIn['date'])
                
                fileOuts[outDest].append(rowOut)
            
            
            sumVolume=0
            previousDate = rowIn['date']
            previousDest = rowIn['dest']
            rowOut={}
            rowOut['date']=dateToISO(rowIn['date'])
            #rowOut['dest']=rowIn['dest']
            outDest = rowIn['dest']
        
        rowIn['volume']=int(rowIn['volume'])
        sumVolume = rowIn['volume'] + sumVolume
        
        
    #last line
    rowOut['nuitées'] = sumVolume
    if sumVolume==0:
        print('ignore null volume data for date:'+rowOut['date']+' dep:'+outDest)
    else:
        fileOuts[outDest].append(rowOut)

#derivatives
#https://community.tableau.com/docs/DOC-1403 
# https://www.mathematik.uni-dortmund.de/~kuzmin/cfdintro/lecture4.pdf
def secondOrderDerivative():
    for dest in fileOuts:
        i=0
        nbRows = len(fileOuts[dest]) 
        for i in range(nbRows):
            # The below calculation is a second order approximation of the derivative of f(x)
            
            
            rowsOut=fileOuts[dest]
            def lookup(offset): 
                return rowsOut[i+offset]['nuitées']

            # assume derivative is calculated on day basis, ie. x-axis offset = 1 
            # If the current row is the first row, then use forward difference to compute the endpoint
            if i==0: 
                rowsOut[i]['différence']=-0.5*(lookup(+2)-4*lookup(+1)+3*lookup(0))
            # If the current row is the last row, then use backward difference to compute the endpoint
            elif i==nbRows-1:
                rowsOut[i]['différence']=0.5*(lookup(-2)-4*lookup(-1)+3*lookup(0))
            else:
                # Otherwise use the second order centered difference
                rowsOut[i]['différence']=0.5*(lookup(1)-lookup(-1))

def firstOrderDerivative():
    for dest in fileOuts:
        i=0
        nbRows = len(fileOuts[dest]) 
        for i in range(nbRows):
            # The below calculation is a second order approximation of the derivative of f(x)
            
            
            rowsOut=fileOuts[dest]
            def lookup(offset): 
                return rowsOut[i+offset]['nuitées']

            # assume derivative is calculated on day basis, ie. x-axis offset = 1 
            # If the current row is the first row, then use forward difference to compute the endpoint
            if i==0: 
                rowsOut[i]['différence']=-0.5*(lookup(+2)-4*lookup(+1)+3*lookup(0))
            # If the current row is the last row, then use backward difference to compute the endpoint
            elif i==nbRows-1:
                rowsOut[i]['différence']=lookup(0)-lookup(-1)
            else:
                # Otherwise use the first order backward
                rowsOut[i]['différence']=lookup(0)-lookup(-1)

firstOrderDerivative()

for dest in fileOuts:
    with open('./assets/datasources/par_origin_agg_'+dest+'.csv', 'w') as csvoutfile:
        fieldnames = ['date','différence','nuitées']
        writer = csv.DictWriter(csvoutfile, fieldnames=fieldnames)
        writer.writeheader()
        #print(fileOuts[dest])
        for rowOut in fileOuts[dest]:
            writer.writerow(rowOut)
    #with open('./assets/datasources/par_origin_agg_'+dest+'.js', 'w') as jsoutfile:  
        #jsoutfile.writelines('const par_origin_agg = ')
        #json.dump(fileOuts[dest], jsoutfile)   

    print ('org: '+dest+' read %s -> write %s'% (i,len(fileOuts[dest])))
