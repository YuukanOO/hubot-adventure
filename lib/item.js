class Item {
  constructor(id, value, description) {
    this.id = id;
    this.value = value;
    this.description = description;
  }

  toString() {
    return (typeof this.description === 'function') ? this.description(this) : this.description;
  }
}

module.exports = Item;