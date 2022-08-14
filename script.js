// thanks : https://github.com/yek-org/yek-js & https://www.npmjs.com/package/jsmediatags & https://mp3tag.js.org

const fix = {
	float(value, decimals) {
		return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
	},

	variable(variable, value) {
		// document.documentElement.style.setProperty(`--${variable}`, value);
		jQuery(':root').css(`--${variable}`, value);
	},

	percentage(value, total) {
		return fix.float((value / total) * 100, 3);
	},

	calc(that, ev, variable) {
		const $this = jQuery(that);
		const value = ev.offsetX;
		const max = $this.width(); /* .offsetWidth */
		const perc = fix.percentage(value, max);
		fix.variable(variable, `${perc}%`);

		return { $this, perc };
	},

	increase(value = 0, max = 2, step = 1) {
		return value + step >= max ? 0 : value + step;
	},

	pad(number) {
		let num = parseInt(number);
		return num >= 0 && num <= 9 ? `0${num}` : num;
	},

	moment(time) {
		let $time = moment.duration(parseInt(time), 'seconds');
		let hour = $time.hours();
		let min = $time.minutes();
		let sec = $time.seconds();
		let _hour = hour > 0 ? `${fix.pad(hour)} : ` : ``;
		let _min_sec = `${fix.pad(min)} : ${fix.pad(sec)}`;
		return `${_hour}${_min_sec}`;
	},

	url(url) {
		return encodeURI(url);
	},

	random(min, max) {
		let _min = max ? min : 0;
		let _max = max || min;
		return Math.floor(Math.random() * (_max - _min + 1)) + _min;
	},
};

class Track {
	static SRC_PREFIX = `https://raw.githubusercontent.com/miko-github/miko-github/gh_assets/assets/sounds`;
	title = 'Unknown';
	artist = 'unknown';
	cover = `https://www.iphonefaq.org/files/styles/large/public/apple_music.jpg?itok=nqYGxWgh`;

	constructor(data) {
		this.setId(data.id);
		this.setTitle(data.title);
		this.setSrc(data.src);
		this.setArtist(data.artist);
		this.setCover(data.cover);
	}

	setId(id) {
		this.id = id;
		return this;
	}

	setSrc(src) {
		this.src = fix.url(`${Track.SRC_PREFIX}/${src}`);
		return this;
	}

	setTitle(title) {
		this.title = title;
		return this;
	}

	setArtist(artist) {
		this.artist = artist;
		return this;
	}

	setCover(cover) {
		this.cover = cover;
		return this;
	}

	getId() {
		return this.id;
	}

	getSrc() {
		return this.src;
	}

	getTitle() {
		return this.title;
	}

	getArtist(doFormat = false) {
		return doFormat ? Track.fixArtist(this.artist) : this.artist;
	}

	getCover() {
		return this.cover;
	}

	static fixArtist(artist) {
		if (artist.length > 1) return artist.join(' & ');
		return artist[0];
	}

	static tags(url) {
		return new Promise(function (resolve, reject) {
			const reader = new FileReader();

			reader.onload = function () {
				const buffer = this.result;
				const tags = new MP3Tag(buffer);

				tags.read();

				return resolve(tags.tags);
			};

			reader.readAsArrayBuffer(url);
		});
	}

	static cover({ data, format }) {
		let base64String = '';

		for (let item of data) {
			base64String += String.fromCharCode(item);
		}

		return `data:${data.format};base64,${window.btoa(base64String)}`;
	}
}

class Playlist {
	constructor() {
		this.tracks = [];
	}

	add(data) {
		this.push(new Track(data));
		return this;
	}

	addMany(tracks) {
		tracks.map((track) => this.add(track));
		return this;
	}

	push(data) {
		this.tracks.push(data);
		return this;
	}

	get(trackId) {
		let trackIndex = thhis.tracks.indexOf(trackId);
		let trackItem = this.tracks[trackIndex > -1 ? trackIndex : 0];
		return trackItem;
	}

	getByArtist(artistName) {
		let trackItems = this.tracks.filter((track) => {
			if (isType(track.artist, 'array')) {
				return track.artist.includes(artistName);
			}

			return track.artist == artistName;
		});

		return trackItems;
	}

	getByIndex(trackIndex) {
		return this.tracks[trackIndex];
	}

	getAll() {
		return this.tracks;
	}

	remove(trackId) {
		this.tracks = this.tracks.filter((track) => track.id != trackId);
	}

	render(render, $wrapper) {
		this.$this = render;
		this.$wrapper = $wrapper;

		this.$this.render($wrapper);
	}
}

class PlaylistRender {
	// WARN : this class and that effects not clean (just work but not best)
	constructor(tracks) {
		this.tracks = tracks;
		this.$ = jQuery;
	}

	onClick(handleClickPlaylistTrack) {
		this.handleClickPlaylistTrack = handleClickPlaylistTrack;
		return this;
	}

	setClassNames(classNames) {
		this.classNames = classNames;
	}

	$Track(props) {
		const $li = this.$(/*html*/ `<li></li>`);
		const $fig = this.$(/*html*/ `<figure></figure>`);
		const $img = this.$(/*html*/ `<img />`);
		const $span = this.$(/*html*/ `<span></span>`);
		const $i = this.$(/*html*/ `<i></i>`);
		const $div = this.$(/*html*/ `<div></div>`);
		const $h3 = this.$(/*html*/ `<h3></h3>`);
		const $p = this.$(/*html*/ `<p></p>`);

		$li.addClass('playlist__item')
			.addClass('playlist__track')
			.addClass('track')
			.attr({ id: `playlist-track-${props.id}` })
			.data({ src: props.src })
			.data({ id: props.id })
			.attr({ tabindex: 0 });
		$fig.addClass('track__cover');
		$img.addClass('track__image')
			.attr({ src: props.cover })
			.attr({
				alt: `cover of ${props.title} from ${Track.fixArtist(
					props.artist,
				)}`,
			});
		$span.addClass('track__overlay');
		$i.addClass('track__icon').addClass('fa').addClass('fa-play');
		$div.addClass('track__details');
		$h3.addClass('track__title');
		$p.addClass('track__artist');

		$h3.text(props.title);
		$p.text(Track.fixArtist(props.artist));

		// appending
		$span.append($i);
		$fig.append($img);
		$fig.append($span);
		$li.append($fig);

		$div.append($h3);
		$div.append($p);
		$li.append($div);

		// $li.on(
		// 	'click',
		// 	this.handleClickPlaylistTrack.bind(this, $li.clone(true, true)),
		// );

		return $li.clone(true, true);
	}

	handleClickPlaylistTrack() {
		// let trackId = $(this).data('id');
		// return trackId;
	}

	handleActiveTrack(trackId) {
		this.activeTrack = `playlist-track-${trackId}`;
		return this;
	}

	highlight() {}

	create(tracks) {
		// return goCurrentPlaylistItem();
	}

	clear() {
		this.$wrapper.empty();
	}

	clearPlayingClass(className = '') {
		this.$tracks.map(($track) => {
			$track.removeClass(className);
		});
	}

	clearPlayingIcon(play, pause) {
		this.$tracks.map(($track) => {
			let $icon = $track.find('.track__icon');
			if ($icon.hasClass(pause)) {
				$icon.removeClass(pause).addClass(play);
			}
		});
	}

	render($wrapper) {
		this.$wrapper = $wrapper;
		this.clear();
		this.$tracks = this.tracks.tracks.map((track) => {
			let $track = this.$Track(track);
			$track.on('click', this.handleClickPlaylistTrack);
			return $track;
		});
		$wrapper.append(this.$tracks);
		this.$tracks.map(($track) => {
			let $icon = $track.find('.track__icon');

			if ($icon.hasClass(this.classNames.playIcon)) {
				$track.addClass(this.classNames.trackPlay);
			}

			if ($track.attr('id') === this.activeTrack) {
				$track.addClass(this.classNames.trackActive);
				if ($icon.hasClass(this.classNames.playIcon)) {
					$icon.removeClass(this.classNames.playIcon);
					$icon.addClass(this.classNames.pauseIcon);
					$track.removeClass(this.classNames.trackPlay);
				}

				document
					.getElementById($track.attr('id'))
					.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}
}

class LinkedNode {
	point = {
		next: null,
		prev: null,
	};

	constructor(value, index = null) {
		this.setValue(value);
		this.setIndex(index);
	}

	setIndex(index) {
		if (index != null) {
			this.index = index;
		}
		return this;
	}

	getIndex() {
		return this.index;
	}

	setValue(value) {
		this.value = value;
		return this;
	}

	getValue() {
		return this.value;
	}

	setNextPoint(nextPoint) {
		this.point.next = nextPoint;
		return this;
	}

	getNextPoint() {
		return this.point.next;
	}

	hasNextPoint() {
		return this.point.next != null;
	}

	setPrevPoint(prevPoint) {
		this.point.prev = prevPoint;
		return this;
	}

	getPrevPoint() {
		return this.point.prev;
	}

	hasPrevPoint() {
		return this.point.prev != null;
	}
}

class LinkedList {
	// NOTE : [head, ...items, tail] //
	list = [];
	currentNode = null;
	head = null;
	tail = null;
	index = 0;

	constructor() {}

	add(value) {
		const index = this.autoincrement();
		const node = new LinkedNode(value, index);

		if (this.length() === 0) {
			this.setHead(node);
			this.setTail(node);
			this.setCurrentNode(node);
			this.push(node);
			return this;
		}

		if (this.length() === 1) {
			let head = this.getHead();
			this.setTail(node);
			head.setNextPoint(node.getIndex());
			node.setPrevPoint(head.getIndex());
			this.push(node);
			return this;
		}

		if (this.length() > 1) {
			let tail = this.getTail();
			tail.setNextPoint(node.getIndex());
			node.setPrevPoint(tail.getIndex());
			this.setTail(node);
			this.push(node);
		}

		return this;
	}

	autoincrement() {
		this.index = this.index + 1;
		return this.index;
	}

	getCurrentNode() {
		return this.currentNode;
	}

	setCurrentNode(node) {
		this.currentNode = node;
		return this;
	}

	setTail(node) {
		this.tail = node;
		return this;
	}

	getTail() {
		return this.tail;
	}

	setHead(node) {
		this.head = node;
		return this;
	}

	getHead() {
		return this.head;
	}

	getNextNode(fromNode = null) {
		if (fromNode === null) {
			let nextNode = this.getNode(this.getCurrentNode().getNextPoint());
			this.setCurrentNode(nextNode);
			return nextNode;
		}

		let nextNode = this.getNode(fromNode.getNextPoint());
		this.setCurrentNode(nextNode);
		return nextNode;
	}

	getPrevNode(fromNode = null) {
		if (fromNode === null) {
			let prevNode = this.getNode(this.getCurrentNode().getPrevPoint());
			this.setCurrentNode(prevNode);
			return prevNode;
		}

		let prevNode = this.getNode(fromNode.getPrevPoint());
		this.setCurrentNode(prevNode);
		return prevNode;
	}

	canGetNextNode() {
		return this.getCurrentNode().hasNextPoint();
	}

	canGetPrevNode() {
		return this.getCurrentNode().hasPrevPoint();
	}

	length() {
		return this.list.length;
	}

	getByIndex(index) {
		return this.list[index];
	}

	getNode(nodeIndex) {
		return this.list.find((node) => node.getIndex() == nodeIndex);
	}

	push(node) {
		this.list.push(node);
		return this;
	}
}

class Player {
	static REPEAT_ALL = 2;
	static REPEAT_ONE = 1;
	static REPEAT_OFF = 0;
	static TIME_TO_BACKWARD = 5;
	static MINIMUM_VOLUME = 0.0;
	static MAXIMUM_VOLUME = 1.0;
	static DEFAULT_VOLUME = 0.5;
	DEFAULT_PLAYLIST_NAME = 'primary';
	DEFAULT_CONFIG = {
		shuffle: false,
		repeat: Player.REPEAT_ALL,
		volume: Player.DEFAULT_VOLUME,
		isMute: false,
		tracksLength: 13,
	};

	playlists = [];
	currentPlaylist = null;
	currentTrack = null;

	state = {
		isPlaying: false,
		isShufflePlay: false,
	};
	config = {};

	constructor(config) {
		this.config = config || this.DEFAULT_CONFIG;
		this.queue = new LinkedList();
	}

	addPlaylist(playlistName, playlistInstance) {
		this.playlists.push({ name: playlistName, instance: playlistInstance });
		return this;
	}

	removePlaylist(playlistName) {
		this.playlists = this.playlists.filter(
			(playlist) => playlist.name != playlistName,
		);
		return this;
	}

	getPlaylist(playlistName) {
		return this.playlists.find(
			(playlist) => playlist.name === playlistName,
		);
	}

	getCurrentPlaylist() {
		return this.currentPlaylist;
	}

	setPlaylist(playlistName) {
		let playlist = this.playlists.find(
			(playlist) => playlist.name === playlistName,
		);

		this.currentPlaylist = playlist;
		return this;
	}

	addPlayer($player) {
		this.$player = $player;
		this.setVolume(this.getVolume());
		this.trigger();
		return this;
	}

	addPlaylistQueue(playlistName) {
		let playlist = playlistName
			? this.getPlaylist(playlistName)
			: this.getCurrentPlaylist();
		playlist.instance.getAll().map((track) => this.addTrackQueue(track));
		return this;
	}

	addTrackQueue(track) {
		this.queue.add(track);
		return this;
	}

	mount() {
		const currentTrack = this.getCurrentTrack();
		this.setTrack(currentTrack);
		return this;
	}

	setTrack(track) {
		this.setSrc(track);
		this.currentTrack = track;
		return this;
	}

	getCurrentTrack() {
		return this.queue.getCurrentNode().getValue();
	}

	setSrc(track) {
		let trackSource = track.getSrc();
		this.$player.prop('src', trackSource);
		this.$player.attr('src', trackSource);
		return this;
	}

	trigger() {
		const $this = this.$player;

		$this.on('playing', this.handlePlayingAudio.bind(this));
		$this.on('play', this.handlePlayAudio.bind(this));
		$this.on('pause', this.handlePauseAudio.bind(this));
		$this.on('ended', this.handleEndedAudio.bind(this));
	}

	onPlay(handlePlayAudio) {
		this.$player.on('play', handlePlayAudio);
		this.$player.on('playing', handlePlayAudio);
		return this;
	}

	onPause(handlePauseAudio) {
		this.$player.on('pause', handlePauseAudio);
		this.$player.on('ended', handlePauseAudio);
		return this;
	}

	onVolumeChange(handleVolumeChangeAudio) {
		this.$player.on('volumechange', handleVolumeChangeAudio);
		return this;
	}

	onDurationChange(handleDurationChangeAudio) {
		this.$player.on('durationchange', handleDurationChangeAudio);
		return this;
	}

	onTimeUpdate(handleTimeUpdateAudio) {
		this.$player.on('timeupdate', handleTimeUpdateAudio);
		return this;
	}

	handleEndedAudio() {
		if (this.isRepeatAll()) {
			return this.forward();
		}

		if (this.isRepeatOne()) {
			return this.play();
		}

		if (this.isRepeatOff()) {
			this.state.isPlaying = false;
			return this.stop();
		}
	}

	handlePlayingAudio() {
		this.state.isPlaying = true;
	}

	handlePauseAudio() {
		this.state.isPlaying = false;
	}

	handlePlayAudio() {
		this.state.isPlaying = true;
	}

	duration(doFormat = false) {
		if (doFormat) {
			return fix.moment(this.$player.prop('duration'));
		}

		return window.parseFloat(this.$player.prop('duration'));
	}

	time(doFormat = false) {
		if (doFormat) {
			return fix.moment(this.$player.prop('currentTime'));
		}

		return window.parseFloat(this.$player.prop('currentTime'));
	}

	setTime(time) {
		this.$player.prop('currentTime', time);
	}

	isPlaying() {
		return this.state.isPlaying;
	}

	play() {
		this.$player.trigger('play');
		return this;
	}

	playShuffle() {
		const shuffleIndex = fix.random(1, this.config.tracksLength);
		const track = this.queue.getNode(shuffleIndex);
		this.queue.setCurrentNode(track);
		this.mount();
		this.play();
		return this;
	}

	pause() {
		this.$player.trigger('pause');
		return this;
	}

	stop() {
		this.pause();
		this.setTime(0);
		return this;
	}

	toggleAction() {
		if (this.isPlaying()) {
			this.pause();
		} else {
			this.play();
		}

		return this;
	}

	forward() {
		if (this.isShufflePlay()) {
			return this.playShuffle();
		}

		if (this.queue.canGetNextNode()) {
			this.queue.getNextNode();
			this.mount();
			return this.play();
		}
	}

	backward() {
		if (this.time() >= Player.TIME_TO_BACKWARD) {
			this.mount();
			return this.play();
		}

		if (this.queue.canGetPrevNode()) {
			this.queue.getPrevNode();
			this.mount();
			return this.play();
		}
	}

	isRepeatAll() {
		return this.config.repeat === Player.REPEAT_ALL;
	}

	isRepeatOne() {
		return this.config.repeat === Player.REPEAT_ONE;
	}

	isRepeatOff() {
		return this.config.repeat === Player.REPEAT_OFF;
	}

	switchRepeat() {
		// flow : (all => one => off).repeat();
		if (this.isRepeatAll()) {
			this.config.repeat = Player.REPEAT_ONE;
			return this.config.repeat;
		}

		if (this.isRepeatOne()) {
			this.config.repeat = Player.REPEAT_OFF;
			return this.config.repeat;
		}

		if (this.isRepeatOff()) {
			this.config.repeat = Player.REPEAT_ALL;
			return this.config.repeat;
		}
	}

	isShufflePlay() {
		return this.state.isShufflePlay;
	}

	isShuffleEnable() {
		return this.config.shuffle === true;
	}

	enableShuffle() {
		this.config.shuffle = true;
		this.state.isShufflePlay = true;
		return this;
	}

	disableShuffle() {
		this.config.shuffle = false;
		this.state.isShufflePlay = false;
		return this;
	}

	toggleShuffle(value = null) {
		if (value !== null) {
			this.config.shuffle = !value;
			this.state.isShufflePlay = !value;
			return this;
		}

		return this.isShuffleEnable()
			? this.disableShuffle()
			: this.enableShuffle();
	}

	isMute() {
		return this.config.isMute;
	}

	mute() {
		this.$player.prop('volume', Player.MINIMUM_VOLUME);
		this.config.isMute = true;
		return this;
	}

	unmute() {
		this.config.isMute = false;
		this.setVolume(this.getVolume());
		return this;
	}

	toggleMute() {
		return this.isMute() ? this.unmute() : this.mute();
	}

	setVolume(offset) {
		let volume = Player.fixVolume(offset);
		this.config.volume = volume;
		this.$player.prop('volume', volume);

		if (volume <= Player.MINIMUM_VOLUME) {
			this.mute();
		}

		return this;
	}

	getVolume() {
		return this.config.volume;
	}

	static fixVolume(volume) {
		return volume > Player.MAXIMUM_VOLUME
			? fix.float(volume / 100, 3)
			: volume;
	}
}

class DetailsRender {
	constructor($this) {
		this.$this = $this;
		this.$cover = $this.$cover;
		this.$title = $this.$title;
		this.$artist = $this.$artist;
	}

	update(data) {
		this.setArtist(data.artist);
		this.setTitle(data.title);
		this.setCover(data.cover);
	}

	setArtist(artist) {
		this.$artist.html(Track.fixArtist(artist));
		return this;
	}

	setTitle(title) {
		this.$title.html(title);
		return this;
	}

	setCover(src) {
		this.$cover.attr({ src: src });
		this.$cover.attr({
			alt: `track cover of ${this.$title.text()} - ${this.$artist.text()}`,
		});
		return this;
	}
}

const playlist = new Playlist('primary');

playlist
	.add({
		id: 0,
		title: `Arayeshe Ghaliz`,
		src: `Homayoun Shajarian - Arayeshe Ghaliz.mp3`,
		artist: [`Homayoun Shajarian`],
		cover: `https://www.ganja2music.com/Image/Post/06.93/08/Homayoun-Shajarian---Arayes.jpg`,
	})
	.add({
		id: 1,
		title: `Nowruz`,
		src: `Homayoun Shajarian & Sohrab Pournazeri - Norouz.mp3`,
		artist: [`Homayoun Shajarian`],
		cover: `https://myritm.com/Uploads/Pictures/1397-07/H/Homayoun-Shajarian-Norooz-Picture.jpg`,
	})
	.add({
		id: 2,
		title: `Sholeh Var (Flaming)`,
		src: `Homayoun_shajarian_SholehVar_Final.mp3`,
		artist: [`Homayoun Shajarian`],
		cover: `https://www.ganja2music.com/Image/Post/5.2021/Homayoun Shajarian - Flaming (Sholeh Var).jpg`,
	})
	.add({
		id: 3,
		title: `Saghi Bia`,
		src: `MohammadReza Shajaryan - Saghi Bia.mp3`,
		artist: [`Mohammad Reza Shajarian`],
		cover: `https://mahurmusic.com/wp-content/uploads/ostad_shajarian_saghi_bia.jpg`,
	})
	.add({
		id: 4,
		title: `Rap God`,
		src: `Eminem - Rap God.mp3`,
		artist: [`Eminem`],
		cover: `https://i1.sndcdn.com/artworks-000060420372-r3rrjq-t500x500.jpg`,
	})
	.add({
		id: 5,
		title: `Bande Naaf Ta Khatte Saaf`,
		src: `yas-bande-naaf-ta-khatte-saaf-ft-moer.mp3`,
		artist: [`Yas`, `Moer`],
		cover: `https://www.ganja2music.com/Image/Post/3.2018/Yas - Bande Naaf Ta Khatte Saaf (Ft Moer).jpg`,
	})
	.add({
		id: 6,
		title: `Halal Osoun`,
		src: `ali_ardavan & sohrab mj_halal_osoun.mp3`,
		artist: [`Ali Ardavan`, `Sohrab MJ`],
		cover: `http://r3d-dl.online/thumb500/AliArdavanHalalOsoun.jpg`,
	})
	.add({
		id: 7,
		title: `Sobhoone`,
		src: `Ho3ein - Sobhoone.mp3`,
		artist: [`Ho3ein`],
		cover: `https://i1.sndcdn.com/artworks-P62UUTWyllEk4zqO-5e8VaA-t500x500.jpg`,
	})
	.add({
		id: 8,
		title: `Hamid Sefat - Hayhat`,
		src: `Hamid Sefat - Hayhat.mp3`,
		artist: [`Hamid Sefat`],
		cover: `https://i1.sndcdn.com/artworks-000219705530-hx9noo-t500x500.jpg`,
	})
	.add({
		id: 9,
		title: `Makhlase Kaloom`,
		src: `Shayea - Makhlase Kaloom.mp3`,
		artist: [`Shayea`],
		cover: `https://i1.sndcdn.com/artworks-cWW8UKEe1zhiRgBk-WWS5xQ-t500x500.jpg`,
	})
	.add({
		id: 10,
		title: `Tukur Tukur`,
		src: `Tukur Tukur - Arijit Singh.mp3`,
		artist: [`Pritam Chakraborty`],
		cover: `https://a10.gaanacdn.com/gn_img/albums/w4MKPgOboj/4MKPanrg3o/size_l.webp`,
	})
	.add({
		id: 11,
		title: `Tharki Chokro`,
		src: `01 - Tharki Chokro.mp3`,
		artist: [`Swaroop Khan`],
		cover: `https://a10.gaanacdn.com/images/albums/99/265399/crop_480x480_265399.jpg`,
	})
	.add({
		id: 12,
		title: `BTS - Mic Drop`,
		src: `Bts-Mic-Drop-128.mp3`,
		artist: [`BTS`],
		cover: `https://i1.sndcdn.com/artworks-000402783318-vlz0bb-t500x500.jpg`,
	})
	.add({
		id: 13,
		title: `Ludovico Einaudi - Experience`,
		src: `Ludovico Einaudi - Experience.mp3`,
		artist: [`Ludovico Einaudi`],
		cover: `https://i1.sndcdn.com/artworks-000505758237-m6u0q8-t500x500.jpg`,
	});

const player = new Player();
const $ = jQuery;
const $BUTTON_ENABLED = 'button--active';
const $BUTTON_DISABLED = 'button--diactive';
const $ACTION_PLAY_ICON = 'fa-play';
const $ACTION_PAUSE_ICON = 'fa-pause';
const $VOLUME_MUTE_ICON = 'fa-volume-mute';
const $VOLUME_UNMUTE_ICON = 'fa-volume';
const $REPEAT_ALL_ICON = 'fa-repeat';
const $REPEAT_ONE_ICON = 'fa-repeat-1';
const $REPEAT_OFF_ICON = 'fa-repeat';
const $PLAYLIST_WRAPPER_ACTIVE = 'playlist--active';
const $PLAYLIST_WRAPPER_DIACTIVE = 'playlist--diactive';
const $PLAYLIST_ACTIVE_TRACK = 'track--active';
const $PLAYLIST_PLAY_TRACK = 'track--play';
const $CSS_VOLUME = 'bar-percentage-volume';
const $CSS_DURATION = 'bar-percentage-duration';
const $CSS_VOLUME_HOVER = 'bar-percentage-volume-hover';
const $CSS_DURATION_HOVER = 'bar-percentage-duration-hover';
const $playlists = new PlaylistRender(playlist);

jQuery(document).ready(function ($) {
	const $player = {
		audio: $('audio#player-main-audio'),
		action: $('.button--action'),
		forward: $('.button--forward'),
		backward: $('.button--backward'),
		repeat: $('.button--repeat'),
		shuffle: $('.button--shuffle'),
		playlist: $('.player__playlist.playlist'),
		volumeAction: $('.button--volume'),
		volumebar: $('.bar--volume'),
		durationbar: $('.bar--duration'),
		duration: $('.duration__until'),
		time: $('.duration__current'),
		buttons: $('[class*="button--"]'),
	};
	const $placeholder = {
		$title: $('.placeholder--title'),
		$artist: $('.placeholder--artist'),
		$cover: $('.placeholder--cover'),
		$time: $('.placeholder--current'),
		$duration: $('.placeholder--duration'),
	};
	const $playlist = {
		wrapper: $('.playlist__list'),
		close: $('.button--close'),
		open: $('.button--playlist'),
	};
	const $details = new DetailsRender($placeholder);

	$playlists.setClassNames({
		playIcon: $ACTION_PLAY_ICON,
		pauseIcon: $ACTION_PAUSE_ICON,
		playlistActive: $PLAYLIST_WRAPPER_ACTIVE,
		playlistDiactive: $PLAYLIST_WRAPPER_DIACTIVE,
		trackPlay: $PLAYLIST_PLAY_TRACK,
		trackActive: $PLAYLIST_ACTIVE_TRACK,
		// trackPause: $PLAYLIST_PAUSE_TRACK
	});

	player.addPlayer($player.audio);
	player.addPlaylist('primary', playlist);
	player.setPlaylist('primary');
	player.addPlaylistQueue('primary');
	player.mount();

	player.onPlay(handlePlayPlayerAudio.bind($player.action));
	player.onPause(handlePausePlayerAudio.bind($player.action));
	player.onVolumeChange(handleVolumePlayerAudio.bind($player.volumeAction));
	player.onDurationChange(
		handleMountPlayerAudio.bind($details, $playlist.wrapper),
	);
	player.onTimeUpdate(handleTimePlayerAudio.bind($placeholder.$time));
	player.onDurationChange(
		handleDurationPlayAudio.bind($placeholder.$duration),
	);

	// $player.durationbar.on("mousedown", handleMouseDownDurationbar);
	// $player.durationbar.on("mouseup", handleMouseUpDurationbar);
	$player.buttons.on('mouseup', handleMouseUpButtons);
	$player.buttons.on('mouseleave', handleMouseUpButtons);
	$player.durationbar.on('click', handleClickDurationbar);
	$player.durationbar.on('mousemove', handleHoverDurationbar);
	$player.action.on('click', handleClickAction);
	$player.forward.on('click', handleClickForward);
	$player.backward.on('click', handleClickBackward);
	$player.repeat.on('click', handleClickRepeatAction);
	$player.shuffle.on('click', handleClickShuffleAction);
	$player.volumeAction.on('click', handleClickVolumeAction);
	$player.volumebar.on('click', handleClickVolumebar);
	$player.volumebar.on('mousemove', handleHoverVolumebar);

	$playlists.onClick(handleClickPlaylistTrack);
	$playlist.open.on('click', handleClickPlaylist.bind($player.playlist));
	$playlist.close.on('click', handleClickPlaylist.bind($player.playlist));
});

function handleMouseUpButtons() {
	const $this = $(this);
	$this.blur();
}

function handleMountPlayerAudio($playlistWrapper) {
	const $this = this;
	$this.setTitle(player.getCurrentTrack().getTitle());
	$this.setArtist(player.getCurrentTrack().getArtist());
	$this.setCover(player.getCurrentTrack().getCover());
	$playlists.handleActiveTrack(player.getCurrentTrack().getId());
	$playlists.render($playlistWrapper);
}

function handlePlayPlayerAudio() {
	const $this = this;
	const $icon = $this.children(0);

	if ($icon.hasClass($ACTION_PLAY_ICON)) {
		$icon.removeClass($ACTION_PLAY_ICON);
		$icon.addClass($ACTION_PAUSE_ICON);
	}
}

function handlePausePlayerAudio() {
	const $this = this;
	const $icon = $this.children(0);

	if ($icon.hasClass($ACTION_PAUSE_ICON)) {
		$icon.removeClass($ACTION_PAUSE_ICON);
		$icon.addClass($ACTION_PLAY_ICON);
	}
}

function handleVolumePlayerAudio() {
	const $this = this;
	const $icon = $this.children(0);

	if (player.isMute()) {
		return $icon
			.removeClass($VOLUME_UNMUTE_ICON)
			.addClass($VOLUME_MUTE_ICON);
	}

	return $icon.removeClass($VOLUME_MUTE_ICON).addClass($VOLUME_UNMUTE_ICON);
}

function handleTimePlayerAudio() {
	const $this = this;
	const perc = fix.percentage(player.time(), player.duration());
	fix.variable($CSS_DURATION, `${perc}%`);
	$this.html(player.time(true));
}

function handleDurationPlayAudio() {
	const $this = this;
	$this.html(player.duration(true));
}

function handleMouseDownDurationbar() {
	player.pause();
}

function handleMouseUpDurationbar() {
	player.play();
}

function handleClickBackward() {
	return player.backward();
}

function handleClickForward() {
	return player.forward();
}

function handleClickAction() {
	let $this = $(this);
	player.toggleAction();
	$this.attr({ title: player.isPlaying() ? 'pause' : 'play' });
}

function handleClickRepeatAction() {
	let $this = $(this);
	let $icon = $this.children(0);

	player.switchRepeat();

	if (player.isRepeatOff()) {
		disableButton($this);
		return $icon.removeClass($REPEAT_ONE_ICON).addClass($REPEAT_OFF_ICON);
	} else {
		enableButton($this);
	}

	if (player.isRepeatAll()) {
		return $icon.removeClass($REPEAT_OFF_ICON).addClass($REPEAT_ALL_ICON);
	}

	if (player.isRepeatOne()) {
		return $icon.removeClass($REPEAT_ALL_ICON).addClass($REPEAT_ONE_ICON);
	}
}

function handleClickShuffleAction() {
	const $this = $(this);

	player.toggleShuffle();

	if (player.isShuffleEnable()) {
		return enableButton($this);
	}

	return disableButton($this);
}

function handleClickVolumeAction() {
	let $this = $(this);
	let volume = '0%';

	player.toggleMute();

	if (player.isMute()) {
		return fix.variable($CSS_VOLUME, volume);
	}

	volume = fix.float(player.getVolume() * 100, 3);
	return fix.variable($CSS_VOLUME, `${volume}%`);
}

function handleClickVolumebar(ev) {
	const { $this, perc } = fix.calc(this, ev, $CSS_VOLUME);
	const volume = fix.float(perc / 100, 3);
	player.unmute();
	player.setVolume(volume);
	$this.attr({ title: `${fix.float(volume * 100, 3)}%` });
}

function handleHoverVolumebar(ev) {
	const { $this, perc } = fix.calc(this, ev, $CSS_VOLUME_HOVER);
	const volume = fix.float(perc / 100, 3);
	$this.attr({ title: `${fix.float(volume * 100, 3)}%` });
}

function handleClickDurationbar(ev) {
	const { perc } = fix.calc(this, ev, $CSS_DURATION);
	// const time = fix.float(perc * player.$player.prop("duration"), 3);
	const time = (perc / 100) * player.duration();
	player.setTime(time);
}

function handleHoverDurationbar(ev) {
	const { $this, perc } = fix.calc(this, ev, $CSS_DURATION_HOVER);
	const time = (perc / 100) * player.duration();
	$this.attr({ title: fix.moment(time) });
}

function enableButton($this) {
	$this.hasClass($BUTTON_DISABLED) && $this.removeClass($BUTTON_DISABLED);
	return $this.addClass($BUTTON_ENABLED);
}

function disableButton($this) {
	$this.hasClass($BUTTON_ENABLED) && $this.removeClass($BUTTON_ENABLED);
	return $this.addClass($BUTTON_DISABLED);
}

function handleClickPlaylist() {
	const $this = this;

	if ($this.hasClass($PLAYLIST_WRAPPER_DIACTIVE)) {
		console.log('playlist-opened');
		$playlists.render($this.find('.playlist__list'));
	}

	$this
		.toggleClass($PLAYLIST_WRAPPER_ACTIVE)
		.toggleClass($PLAYLIST_WRAPPER_DIACTIVE);
}

function handleClickPlaylistTrack() {
	const $this = $(this);
	const trackIndex = $this.data('id');
	const track = player.queue.getByIndex(trackIndex);
	player.queue.setCurrentNode(track);
	player.mount();
	player.play();
	$playlists.clearPlayingClass($PLAYLIST_ACTIVE_TRACK);
	$playlists.clearPlayingIcon($ACTION_PLAY_ICON, $ACTION_PAUSE_ICON);
	$this.addClass($PLAYLIST_ACTIVE_TRACK);
	$this
		.find('.track__icon')
		.toggleClass($ACTION_PLAY_ICON)
		.toggleClass($ACTION_PAUSE_ICON);
}

/*	[VERSION : 1.0.0] (2022-01-18) : upload-file process

	// +++ HELPER FUNCTIONS +++ //
	function goCurrentPlaylistItem() {
	  let $currentItem = [...$_playlist_tracks.children].filter(
		($track) =>
		  parseInt($track.dataset.id) == trackList[state.currentTrackIndex].id
	  )[0];
	  [...$_playlist_tracks.children].map(
		($track) =>
		  $track.className.indexOf("playlist__track--current") != -1 &&
		  $track.classList.remove("playlist__track--current")
	  );
	  $currentItem.className.indexOf("playlist__track--current") == -1 &&
		$currentItem.classList.add("playlist__track--current");
	  $currentItem.scrollIntoView({
		behavior: "smooth",
		block: "start",
		inline: "nearest"
	  });
	}
	// listener(window, 'load', () => ($audio.volume = 0.5));
	// [file]:change
	listener($_file, "change", () => {
	  // $audio.pause();
	  [...Array($_file.files.length).keys()].forEach((index) => {
		let file = $_file.files[index];
		let src = URL.createObjectURL(file);
		fetchMetadata(file, (tags) => {
		  let track = {
			id: (() => trackList[trackList.length - 1].id + 1)(),
			title: tags.title,
			cover: tags.picture && fetchCover(tags.picture),
			artist: tags.artist,
			src
		  };
		  trackList.push(track);
		});
		updateMetaData(src);
	  });
	  $audio.play();
	});
	// ALT

  listener($_file, 'change', () => {
	$audio.pause();
	[...Array($_file.files.length).keys()].forEach((index) => {
	  let file = $_file.files[index];
	  let src = URL.createObjectURL(file);
	  fetchMetadata2(file, (tags) => {
		let track = {
		  id: (() => trackList[trackList.length - 1].id + 1)(),
		  title: tags.title,
		  cover: tags.v2.APIC[0] && fetchCover(tags.v2.APIC[0]),
		  artist: tags.v2.TPE1,
		  src,
		};
		trackList.push(track);
	  });
	  updateMetaData(src);
	});
	$audio.play();
  });
	// [file]:drag/drop
	window.ondragenter = (e) => {
	  // $audio.pause();
	  $_file.classList.add("music__uploader--show");
	  $_player.classList.add("music--upload");
	};
	$_player.ondrop = () => {
	  $audio.play();
	  $_file.classList.remove("music__uploader--show");
	  $_player.classList.remove("music--upload");
	};

	// +++ VENDORS +++ //
	// NOTE : src from `https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js`
	function fetchMetadata(audio, cb) {
	  jsmediatags.read(audio, {
		onSuccess: ({ tags }) => cb(tags),
		onError: function (error) {
		  console.log(error);
		}
	  });
	}
  
	// FIXME : need to sync with other codes
	// NOTE : src from `https://cdn.jsdelivr.net/npm/mp3tag.js@latest/dist/mp3tag.min.js`
	function fetchMetadata2(url, cb) {
	  const reader = new FileReader();
	  reader.onload = function () {
		const buffer = this.result;
		// MP3Tag Usage
		const mp3tag = new MP3Tag(buffer);
		mp3tag.read();
		cb(mp3tag.tags);
	  };
	  reader.readAsArrayBuffer(url);
	}
  
	function fetchCover({ data, format }) {
	  let base64String = "";
	  for (let item of data) {
		base64String += String.fromCharCode(item);
	  }
	  return `data:${data.format};base64,${window.btoa(base64String)}`;
	}
  
  
  
	
  
   
  
	// FIXME : need to use new methods
	function fixBase64(url, cb) {
	  const xhr = new XMLHttpRequest();
	  xhr.open("GET", url, true);
	  xhr.responseType = `blob` || "arraybuffer";
	  xhr.onload = function () {
		// NOTE : metadata as callback, response is `arrayBuffer`
		if (xhr.status === 200) return cb(xhr.response);
		return console.log(`[fixBase64] : xhr error!`);
	  };
	  xhr.onerror = () => console.log(`[fixBase64] : network error!`);
	  xhr.send();
	}
  
	function fixRandom(min, max) {
	  let _min = max ? min : 0;
	  let _max = max || min;
	  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
	}
  });
  
  */
