export function querySelectorAllLazy(
  selector: string,
  container = document.body,
) {
  const iter = {
    current: container.firstElementChild,
    next() {
      if (!this.current) return { done: true };

      const node = this.current;

      this.current =
        node.firstElementChild ||
        node.nextElementSibling ||
        (() => {
          let parent = node.parentElement;

          while (parent && parent !== container) {
            if (parent.nextElementSibling) return parent.nextElementSibling;
            parent = parent.parentElement;
          }
          return null;
        })();

      return {
        value: node,
        done: false,
      };
    },

    [Symbol.iterator]() {
      return this;
    },
  };

  return {
    next() {
      for (const node of iter) {
        if (node && node.matches(selector)) {
          return {
            value: node,
            done: false,
          };
        }
      }

      return { done: true };
    },

    [Symbol.iterator]() {
      return this;
    },
  };
}
