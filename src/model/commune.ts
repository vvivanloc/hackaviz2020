export interface Commune {
  ID_GEOFLA: string;
  INSEE_COM: string;
  commune: string;
  departement: number;
  latitude: number;
  longitude: number;
  altitude_moy: number;
  statut: string;
  superficie: number;
  departement_nom: string;
  emplois: number;
  habitants: number;
  menages: number;
  pers_par_menages: number;
  unite_conso_menages: number;
  revenu_median: number;
  '2015_1': number;
  '2015_inter_voiture': number;
  '2015_extra_voiture': number;
  '2015_sansvoiture': number;
  '2015_extra_csp1': number;
  '2015_extra_csp2': number;
  '2015_extra_csp3': number;
  '2015_inter_csp1': number;
  '2015_inter_csp2': number;
  '2015_inter_csp3': number;
  '2009_inter': number;
  '2009_extra': number;
  '2009_1': number;
  '2009_extra_communes': number;
  '2009_intra_communes': number;
  '2009_extra_km': number;
  '2009_intra_km': number;
  '2009_extra_heure': number;
  '2009_intra_heure': number;
  '2014_inter': number;
  '2014_extra': number;
  '2014_1': number;
  '2014_extra_communes': number;
  '2014_intra_communes': number;
  '2014_extra_km': number;
  '2014_intra_km': number;
  '2014_extra_heure': number|null;
  '2014_intra_heure': number|null;
}
