import {Component, Input, ViewChild, ElementRef} from "@angular/core";
import {Chose} from "@NoyauFonctionnel/nf";

const htmlTemplate = `
	<div class="view">
		<input 	class			= "toggle" 
				type			= "checkbox" 
				name			= "fait"
				[ngModel]       = "nf.fait"
				(ngModelChange)        = "fait(inputFait.checked)"
				#inputFait/>
		<label (dblclick)="edit()"	class="texte">
		    <span *ngIf="nf.text != ''" >{{nf.texte}}</span>
		    <!--Obligés de mettre les balises sur la même ligne, sinon la page affiche une ligne blanche pour chaque balise qui n'est pas censée 
		        être affichée--><a *ngIf="nf.type === 'image'" href="{{nf.url}}" data-lightbox="Test" data-title="Titre"><img *ngIf="nf.type === 'image'" data-lightbox="" src="{{nf.url}}" alt="tmp" height="50" width="50"></a>
		        <video *ngIf="nf.location == 'Local' && nf.type === 'video'" width="189" height="142" controls>
                <source src="{{nf.url}}" type="video/mp4">
            </video><iframe *ngIf="nf.location == 'Online' && nf.type === 'video'" width="300" height="300" 
                src="{{nf.url}}">
            </iframe><audio *ngIf="nf.type === 'audio'" controls>
                <source src="{{nf.url}}" type="audio/mp3">
            </audio>
        </label>
		<button class="destroy" (click) = "dispose()">
		    
        </button>
	</div>
	<form (submit)="setTexte(newText.value)" *ngIf="editing">
		<input class="edit" [value]="nf.texte" (blur)="setTexte(newText.value)" #newText/>
	</form>
`;

@Component({
  selector		: "item-chose",
  template		: htmlTemplate
})
export class ItemChose {
    @Input ("nf" ) nf   : Chose;
    @ViewChild("newText") newTextInput : ElementRef;
    editing			    : boolean = false;

    dispose() {
        this.nf.dispose();
    }

    fait(f:boolean) {
        this.nf.Fait(f);
    }

    edit() {
        this.editing = true;
        requestAnimationFrame(() => {this.newTextInput.nativeElement.focus();});
    }

    setTexte(s:string, url:string) {
        this.editing = false;
        this.nf.Texte(s);
    }

}
