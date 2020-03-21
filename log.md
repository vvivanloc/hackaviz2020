data study, creating charts with LibreOffice, searching for story

- nuitées: where and when ?
    captain obvious!
    summer/winter
    twice summer / winter

- par_origines: who's coming, when to where and why ? meteo / event ?

- capacités: per week nights + host capacities per types

data granularity
    whole 2018 per day
    only by departement
        no leaflet, geojson just to draw departement border


    timelines
        https://bl.ocks.org/vasturiano/ded69192b8269a78d2d97e24211e64e0
        https://www.cssscript.com/simple-scrollable-timeline-chart-with-d3-js-d3-timeline/
        https://github.com/jiahuang/d3-timeline


        https://visjs.github.io/vis-timeline/examples/timeline/peer-build.html

    meh... how to show cardinality
        colors = bad
        graph ?

    labeled histogram ?
    https://blog.datawrapper.de/img/full-180508_index14.png

        no more D3
        https://medium.com/@PepsRyuu/why-i-no-longer-use-d3-js-b8288f306c9a


        https://www.data-to-viz.com/caveats.html


take a look to BI software
    Microsoft PowerBI Desktop -> why date are concatenated by default ?
    Tableau -> more powerful, faster than Microsoft PowerBI Desktop / oddities

try to find a story
    par_origines who's coming, when to where and why ?
        - why: is meteo or event have an influence on venue ?  hard to say only on one year
        - when: bar should be only good for resolution>day
        - who: bubbles?
        - should data merged by dest? nope 
                      display for all dest? meh?

       timeline with highlighted week end/holidays + meteo + top 3/10 origins? on a map?                 


https://metricsgraphicsjs.org/examples.htm#annotations
https://plot.ly/javascript/aggregations/
https://viserjs.github.io/demo.html#/viser/map/bubble-map

 « l’équivalent de 3 captures d’écran si la réalisation est sur le web »

 carte France+Europe
    pas facile de trouver une carte avec des marqueurs -> calcul avec       bbox des paths

BE+LU
CH
DE
DK+SE+NP
ES+PT
GB
IT
NL
US
Autres

 avec timeline + play

https://www.notion.so/News-Letter-TDV-Hackaviz-2020-1-a7e85f7175574c0494e222c89db40cd3

ou la météo a-t-elle une influence sur la venue des touristes ?

powerbi ou tableau
tableau public
focus on make delivery, not how to do this
refine

finite difference
https://community.tableau.com/docs/DOC-1403

:( crash online  -> save often


no band, try ->
http://dygraphs.com/tutorial.html
csv+ band


process data
    powerbi/tableau ?
    LibreOffice Base ?
    LibreOffice Calc ?
    python :(
        tri par LibreOffice d'abord
        export in CSV = lighter file


