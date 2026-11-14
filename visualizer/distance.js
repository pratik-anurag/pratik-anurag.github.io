export function relativeDistance(distance,row,column){
 const value=distance.matrix[row]?.[column],local=distance.matrix[row]?.[row];
 return Number.isFinite(value)&&value>0&&Number.isFinite(local)&&local>0?value/local:null;
}
export function distanceDescription(distance,row,column){
 const value=distance.matrix[row]?.[column],ratio=relativeDistance(distance,row,column);
 return "NUMA "+distance.ids[row]+" → "+distance.ids[column]+": "+(value??"unknown")+(ratio===null?" · local baseline unavailable":" · "+ratio.toFixed(2)+"× local (relative firmware distance)");
}
