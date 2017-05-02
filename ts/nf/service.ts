import { Injectable } from "@angular/core";
import * as NF from "./nf";

// Load from localStorage
type SerialisationChoses = Array<{location: string, texte: string, url: string, type: string, fait: boolean, date: string}>;
let nf = new NF.ListeChoses();
let cbSaveData = () => {
    let serialization : SerialisationChoses = [];
    nf.choses.forEach( c => serialization.push( {location: c.location, texte: c.texte,
        url: c.url, type: c.type, fait: c.fait, date: c.date.toString()} ));
    localStorage.setItem("todoListMiage", JSON.stringify(serialization) );
};

nf.on("update", (nf: NF.ListeChoses, eventName : string, eventValue : NF.EventListeChoses) => {
    if(eventValue.append) {
        let chose = eventValue.append;
        chose.on("update", cbSaveData);
    }
    if(eventValue.remove) {
        let chose = eventValue.remove;
        chose.off("update", cbSaveData);
    }
    cbSaveData();
} );

// Ajouter les choses déjà présentes dans le localStorage
let choses : SerialisationChoses = <SerialisationChoses>JSON.parse( localStorage.getItem("todoListMiage") || "[]" );
choses.forEach( c => {
    console.log("Chose : " + c.texte + " URL : " + c.url + " type : " + c.type + " location : " + c.location);
    nf.Ajouter(c.location, c.texte, c.url, c.type, c.fait, new Date(c.date) );
});

// Define service
@Injectable()
export class ListeChosesService {
    static getData	() : Promise<NF.ListeChoses> {
        return Promise.resolve( nf );
    }
}
