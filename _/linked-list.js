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

// [head, ..., tail] //

class LinkedList {
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

const linkedList = new LinkedList();

linkedList
	.add('a')
	.add('b')
	.add('c')
	.add('d')
	.add('e')
	.add('f')
	.add('g')
	.add('h')
	.add('i')
	.add('j')
	.add('k')
	.add('l');

console.log(linkedList.getCurrentNode());
linkedList.getNextNode();
console.log(linkedList.getCurrentNode());
linkedList.getNextNode();
console.log(linkedList.getCurrentNode());
