const favorites=new Set(['health-check']);
const ALLOWED=new Set(['health-check','privacy-settings','mute-mac','open-downloads']);

export function listFavorites(){return [...favorites]}
export function setFavorite(templateId,value=true){
  const id=String(templateId||'');
  if(!ALLOWED.has(id)) return {ok:false,reason:'TEMPLATE_NOT_ALLOWED'};
  if(value) favorites.add(id); else favorites.delete(id);
  return {ok:true,favorites:listFavorites()};
}
export function exportFavoriteState(){return listFavorites()}
export function importFavoriteState(records=[]){
  favorites.clear();
  for(const id of Array.isArray(records)?records:[]) if(ALLOWED.has(String(id))) favorites.add(String(id));
  return listFavorites();
}
export const favoritePolicy=Object.freeze({templateIdsOnly:true,arbitraryActions:false});
