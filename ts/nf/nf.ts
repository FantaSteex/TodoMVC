

type NF_CallBack = (nf: NF, eventName: string, value: any) => void;
class NF {
	private cbList : Map<string, NF_CallBack[]>;
	constructor() {
		this.cbList = new Map<string, NF_CallBack[]>();

	}
	emit(eventName: string, value: any) : this {
		if( this.cbList.has(eventName) ) {
			let array = this.cbList.get(eventName);
			array.forEach( cb => cb(this, eventName, value) );
		}
		return this;
	}
	on(eventName: string, cb: NF_CallBack) : this {
		if( this.cbList.has(eventName) ) {
			let array : NF_CallBack[] = this.cbList.get(eventName);
			array.push(cb);
		} else {
			this.cbList.set(eventName, [cb]);
		}
		return this;
	}
	off(eventName: string, cb: NF_CallBack) : this {
		if( this.cbList.has(eventName) ) {
			let array = this.cbList.get(eventName);
			array.splice( array.indexOf(cb), 1);
		}
		return this;
	}
}

export type EventChose = {
	fait?	: boolean,
	type?	: string,
	url?	: string,
	texte?	: string,
	location? : string
};
export type NF_Chose_CallBack = (nf: Chose, eventName: string, value: EventChose) => void;
export class Chose extends NF {
	readonly liste		: ListeChoses;
	readonly date 		: Date;
	texte				: string;
	fait 				: boolean;
	type				: string;	//Text, Image, Video, Sound
	url					: string;
	location			: string;	//Online, Local

	constructor	(location: string, texte: string, url: string = "", type: string = "Text",
					liste: ListeChoses, fait: boolean = false, date: Date = null) {
		super();
		this.texte  = texte;
		this.date	= date || new Date( Date.now() );
		this.fait	= fait || false;
		this.liste	= liste;
		this.type = type;
		this.url = url;
		this.location = location;
	}

	getUrl() {
		return this.url;
	}

	dispose		() {
		this.liste.Retirer(this);
	}

	Texte(texte: string) {
		this.texte = texte;
		this.emit("update", {texte: texte});
		return this;
	}

	Url(url: string) {
		this.url = url;
		this.emit("update", {url: url});
		return this;
	}

	Fait(fait: boolean) {
		this.fait = fait;
		this.emit("update", {fait: fait});
		return this;
	}
	on(eventName: "update", cb: NF_Chose_CallBack) : this {
		return super.on(eventName, cb);
	}
	off(eventName: "update", cb: NF_Chose_CallBack) : this {
		return super.off(eventName, cb);
	}
}

export type EventListeChoses = {append?: Chose, remove?:Chose};
export type NF_ListeChose_CallBack = (nf: ListeChoses, eventName: string, value: EventListeChoses) => void;
export class ListeChoses extends NF {
	choses 	: Chose[];
	constructor	() {
		super();
		this.choses = [];
	}
	Ajouter		(location: string, texte: string, url: string = "", type: string = "text", fait: boolean = false, date: Date = null) : this {
		let x : string = type;	//Texte only
		console.log(url);
		if(url !== "") {
			console.log("URL != null : " + type);
			if(location === "Online") {
				if(url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".gif") || url.endsWith(".png"))
					x = "image";
				else if(url.endsWith(".mp4") || url.indexOf("youtube.com") !== -1) {
					x = "video";
					if(url.indexOf("https://www.youtube.com/embed/") === -1) {	//False si la Chose existe dans le nf
						if(url.indexOf("&") === -1) { //Lien youtube simple, sans playlist ou autres
							url = "https://www.youtube.com/embed/" + url.substring(url.indexOf("=") + 1);
							console.log("INDEX OF URL : " + url);
						} else {
							let end : number = url.indexOf("&");
							url = "https://www.youtube.com/embed/" + url.substring(url.indexOf("=") + 1, end);
							console.log("INDEX OF URL : " + url);
						}
					}

				}
				else if(url.endsWith(".mp3"))
					x = "audio";
			}
			console.log("X : " + x);
		} else {
			console.log("Else");
			x = "text";
			if(texte === "")	//Ni url ni texte : ajoute pas
				return this;
		}
		//TODO : tests image, video, audio
		let chose = new Chose(location, texte, url, x, this, fait, date);
		this.choses.push( chose );
		this.emit("update", {append: chose});
		return this;
	}
	Retirer		(chose: Chose) : this {
		this.choses.splice( this.choses.indexOf(chose), 1 );
		this.emit("update", {remove: chose});
		return this;
	}
	on(eventName: "update", cb: NF_ListeChose_CallBack) : this {
		return super.on(eventName, cb);
	}
	off(eventName: "update", cb: NF_ListeChose_CallBack) : this {
		return super.off(eventName, cb);
	}
}


function IsURL(url) : number {
	if(new RegExp("/\.(jpg|gif|png)$/").test(url))
		return 1;
	else if(new RegExp("/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/").test(url) ||
		new RegExp("/\.(mp4)$/").test(url))
		return 2;
	else if(new RegExp("/\.(mp3)$/").test(url))
		return 3;
	return 0;
}
