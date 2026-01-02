const utils = (() => {
  const storage = {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item === null ? defaultValue : JSON.parse(item);
      } catch {
        localStorage.removeItem(key);
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        throw new Error(`utils.storage.set failed: ${error.message}`);
      }
    },
    remove(key) {
      localStorage.removeItem(key);
    },
    clear() {
      localStorage.clear();
    }
  };

  const geo = {
    getCurrent: () => new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation not supported"));
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          resolve({ lat, lng, accuracy });
        },
        error => {
          let message = "Unknown geolocation error";
          if (error.code === error.PERMISSION_DENIED) message = "Location permission denied";
          else if (error.code === error.POSITION_UNAVAILABLE) message = "Location unavailable";
          else if (error.code === error.TIMEOUT) message = "Location timeout";
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    })
  };

  const perf = {
    measure(fn) {
      const start = performance.now();
      const result = fn();

      if (result && typeof result.then === "function") {
        return result.then(() => performance.now() - start);
      }

      return performance.now() - start;
    },
    debounce(fn, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },
    throttle(fn, limit) {
      let last = 0;
      return function (...args) {
        const now = Date.now();
        if (now - last >= limit) {
          last = now;
          fn.apply(this, args);
        }
      };
    }
  };

  const id = (() => {
    let lastTime = 0;
    let counter = 0;

    return {
      create(prefix = "id") {
        let time = Date.now();

        if (time === lastTime) {
          counter++;
        } else {
          counter = 0;
          lastTime = time;
        }

        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${time}-${counter}-${random}`;
      }
    };
  })();

  return {
    storage,
    geo,
    perf,
    id
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = utils;
} else if (typeof window !== "undefined") {
  window.utils = utils;
}
