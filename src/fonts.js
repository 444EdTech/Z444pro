import WebFont from 'webfontloader';

export const loadFonts = () => {
  WebFont.load({
    google: {
      families: ["Libre Baskerville:regular,italic,700"]
    }
  });
};

