export default function getValueFromKeyObj(chaveObj, obj){
    let existKey = Object.keys(obj).filter(function(key){    
        return key === chaveObj
    })    

    if(existKey){
        return obj[existKey]
    } else {
        return null
    }
}