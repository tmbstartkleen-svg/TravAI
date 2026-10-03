import {listTaskTemplates} from './task-templates-v990.mjs';

const favorites=new Set(['health-check']);
const allowedIds=()=>new Set(listTaskTemplates().map(item=>item.id));

export function listFavorites(){return [...favorites]}
export function setFavorite(templateId,value=true){
  const id=String(templateId||'');
  if(!allowedIds().has(id)) return {ok:false,reason:'TEMPLATE_NOT_ALLOWED'};
  if(value) favorites.add(id); else favorites.delete(id);
  return {ok:true,favorites:listFavorites()};
}
export function exportFavoriteState(){return listFavorites()}
export function importFavoriteState(records=[]){
  favorites.clear();
  const allowed=allowedIds();
  for(const id of Array.isArray(records)?records:[]) if(allowed.has(String(id))) favorites.add(String(id));
  return listFavorites();
}
export const favoritePolicy=Object.freeze({templateIdsOnly:true,dynamicTemplateCatalog:true,arbitraryActions:false});
