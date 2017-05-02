import {Component, Input, OnInit, ViewChild, ElementRef}               from "@angular/core";
import {Chose, ListeChoses as ListeChosesNF} 	from "@NoyauFonctionnel/nf";
import {ListeChosesService}                     from "@NoyauFonctionnel/service";

const htmlTemplate = `
	<section class="todoapp" *ngIf="nf">
		<header class="header">
		    <div style="margin-bottom:10px;">
                <br/>
                <span style="font-weight:bold;margin-left:5px;">Media location : 
                    <label for="Local"><input type="radio" name="mediaLocation" id="Local" value="Local" 
                        (change)="location('Local');" checked>Local</label>
                    <label for="Online"><input type="radio" name="mediaLocation" id="Online" value="Online" 
                        (change)="location('Online');" >Online</label>
                </span>
                <ul *ngIf="mediaLocation === 'Local'" class="filters mediatype">
                    <span style="font-weight: bold;margin-left: 5px;">Media type :</span>
                    <li>
                        <a class="mediaTypeimage" (click)="localMedia('image')"
                            [class.selected] = "mediaType === 'image'">image</a>
                    </li>
                    <li>
                        <a class="mediaTypevideo" (click)="localMedia('video')"
                            [class.selected] = "mediaType === 'video'">video</a>
                    </li>
                    <li>
                        <a class="mediaTypeaudio" (click)="localMedia('audio')"
                            [class.selected] = "mediaType === 'audio'">audio</a>
                    </li>
                </ul>
                <br/>
            </div>
            <br/>
            <div *ngIf="mediaLocation === 'Local'" id="previewMedia">
                {{currentLocalMedia === '' ? 'Media preview':''}}
                <img *ngIf="currentLocalMedia !== '' && mediaType === 'image'" src="{{currentLocalMedia}}" height="142" width="142">
                <video *ngIf="currentLocalMedia !== '' && mediaType === 'video'" width="189" height="142" controls>
                    <source src="{{currentLocalMedia}}" type="video/mp4">
                </video>
                <audio *ngIf="currentLocalMedia !== '' && mediaType === 'audio'" controls>
                    <source src="{{currentLocalMedia}}" type="audio/mp3">
                </audio>
            </div>
			<h1>{{titre}}</h1>
			<form *ngIf="mediaLocation === 'Online'" 
			    (submit)="nf.Ajouter('Online', newTodo.value, newTodoUrl.value);newTodo.value ='';newTodoUrl.value = '' ">
			    
			    <input type="submit" value="Create" style="display: none">
				<input class="new-todo" placeholder="URL ?" #newTodoUrl>
				<input class="new-todo" placeholder="Que faire?" #newTodo>
			</form>
			<form *ngIf="mediaLocation === 'Local'" (submit)="nf.Ajouter('Local', newTodo.value, currentLocalMedia, mediaType);newTodo.value ='';clearPreview();iptMedia.value=''">
			    <input type="submit" value="Create" style="display: none">
			    <input type="file" accept="{{mediaType}}/*" id="iptMedia" #iptMedia
                    (change)="changeCurrentMedia(iptMedia.value)">			        
			    <input type="submit" value="Ajouter la tâche" 
			        (click)="nf.Ajouter('Local', newTodo.value, currentLocalMedia, mediaType);newTodo.value ='';clearPreview();iptMedia.value=''">
				<input class="new-todo" placeholder="Que faire?" #newTodo autofocus>
			</form>
		</header>
		<section class="main">
			<input  class="toggle-all" 
			        type="checkbox"
			        [ngModel]="ToutEstFait()"
			        (ngModelChange)="ToutCocherDecocher()"/>
			<label for="toggle-all">Mark all as complete</label>
			<ul class="todo-list">
			    <li *ngFor="let chose of getChoses()" [class.completed] = "chose.fait" [class.editing]="compo.editing">
			        <item-chose [nf]="chose" #compo></item-chose>
                </li>
            </ul>
		</section>
        <footer class="footer">
            <span class="todo-count"><strong></strong> {{getRestante()}} restante(s)</span>
            <ul class="filters">
                <li>
                    <a class="filterAll" (click)="currentFilter = filterAll" 
                        [class.selected] ="currentFilter === filterAll">Tous</a>
                </li>
                <li>
                    <a class="filterActives" (click)="currentFilter = filterActives" 
                        [class.selected] ="currentFilter === filterActives">Actifs</a>
                </li>
                <li>
                    <a class="filterCompleted" (click)="currentFilter = filterCompleted" 
                        [class.selected] ="currentFilter === filterCompleted">Complétés</a>
                </li>
            </ul>
            <button class="clear-completed" (click)="DeleteCompleted()">Supprimer cochées</button>
        </footer>
	</section>
	<hr/>
	<section>
	    <section *ngFor="let chose of getChoses()">
	        {{chose.fait}} : {{chose.texte}}
        </section>
	</section>
`;

type FILTER = (c : Chose) => boolean;
@Component({
  selector		: "liste-choses",
  template		: htmlTemplate
})

export class ListeChoses implements OnInit {
    public nf       : ListeChosesNF;
    public mediaLocation : string = "Local";    //Emplacement du media : Local or Online
    public mediaType : string = "image";    //Type du media : text, image, video or audio
    public currentLocalMedia : string = ""; //Chemin vers le media local que l'utilisateur est en train d'ajouter
    @Input() titre	: string;
    @ViewChild("newTodoUrl") newUrlInput : ElementRef;  //Input correspondant à l'url d'un nouveau média online
    private choses  : Chose[] = [];

    filterAll: FILTER=()=>true;
    filterActives: FILTER=(c)=>!c.fait;
    filterCompleted: FILTER=(c)=>c.fait;
    currentFilter = this.filterAll;

	constructor		(private serviceListe: ListeChosesService) {
	};

	//Appelée lors de l'ajout d'un media local, réinitialise le type et le chemin, permet de vider la zone de preview
    clearPreview() : void {
        this.mediaType = "image";
        this.currentLocalMedia = "";
    }

    //Change le chemin du media local en train d'être ajouté
    changeCurrentMedia(media:string): void {
        this.currentLocalMedia = media;
    }

    //Appelée lors du clic sur l'un des deux radiobutton "Online"/"Local" : modifie le formulaire affiché
	location(loc:string): void {
	    this.mediaLocation = loc;
        if(loc === "Online") {
            this.currentLocalMedia = "";
            requestAnimationFrame(() => {
                this.newUrlInput.nativeElement.focus();
            });
        }
    }

    //Appelée lors du clic sur l'un des trois liens "filter" en haut du formulaire (image, video ou audio) : change le type du media qui sera ajouté
    localMedia(media:string): void {
	    this.mediaType = media;
    }


    //----------------------Partie réalisée en TD-----------------------

    ngOnInit(): void {
        ListeChosesService.getData().then( (nf) => {
            this.nf     = nf;
            this.choses = nf.choses;
        });
    }

    getChoses() : Chose[] {
        return this.choses.filter(this.currentFilter);
    }

    ToutEstFait():boolean {
        return this.nf.choses.reduce((acc,c)=>acc && c.fait,true);
    }

    ToutCocherDecocher() {
        let cocher = !this.ToutEstFait();
        this.nf.choses.forEach(c=>c.Fait(cocher));
    }

    DeleteCompleted() {
        this.choses.filter(this.filterCompleted).forEach(c=>c.dispose());
    }

    getRestante() {
        return this.choses.filter(this.filterActives).length;
    }
}
