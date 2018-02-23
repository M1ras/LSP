class Hierarchy extends Array {
  draw() {
    let canvas = "";
    let firstIndex = 0;
    let lastIndex = this.length - 1;

    for (let index = 0; index < this.length; index++) {
      let isFirstIndex = index == firstIndex;
      let isLastIndex = index == lastIndex;
      let isLastChild = this[index].isLastChild;

      if (isFirstIndex && !isLastIndex && !isLastChild) canvas += "│  ";
      if (isFirstIndex && !isLastIndex && isLastChild) canvas += "   ";

      if (!isFirstIndex && !isLastIndex && !isLastChild) canvas += "│  ";
      if (!isFirstIndex && !isLastIndex && isLastChild) canvas += "   ";

      if (!isFirstIndex && isLastIndex && !isLastChild) canvas += "├─ ";
      if (!isFirstIndex && isLastIndex && isLastChild) canvas += "└─ ";

      if (isFirstIndex && isLastIndex && !isLastChild) canvas += "├─ ";
      if (isFirstIndex && isLastIndex && isLastChild) canvas += "└─ ";
    }

    return canvas;
  }

  add(parent, array, index) {
    return this.concat({
      parent: parent,
      isLastChild: index == array.length - 1,
    });
  }
}

module.exports = Hierarchy;
