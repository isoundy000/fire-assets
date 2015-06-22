Fire.Texture = (function () {

    var canvasCtxToGetPixel = null;

    /**
     * @class WrapMode
     * @static
     * @namespace Texture
     */
    var WrapMode = Fire.defineEnum({
        /**
         * @property Repeat
         * @type number
         */
        Repeat: -1,
        /**
         * @property Clamp
         * @type number
         */
        Clamp: -1
    });

    /**
     * @class FilterMode
     * @static
     * @namespace Texture
     */
    var FilterMode = Fire.defineEnum({
        /**
         * @property Point
         * @type number
         */
        Point: -1,
        /**
         * @property Bilinear
         * @type number
         */
        Bilinear: -1,
        /**
         * @property Trilinear
         * @type number
         */
        Trilinear: -1
    });

    /**
     * Class for texture handling.
     * Use this to create textures on the fly or to modify existing texture assets.
     *
     * @class Texture
     * @extends Asset
     * @constructor
     * @param {Image} [img] - the html image element to render
     */
    var Texture = Fire.Class({

        name: 'Fire.Texture',

        extends: Fire.Asset,

        constructor: function () {
            var img = arguments[0];
            if (img) {
                this.image = img;
                this.width = img.width;
                this.height = img.height;
            }
        },

        properties: {
            /**
             * @property image
             * @type Image
             */
            image: {
                default: null,
                rawType: 'image',
                visible: false
            },
            /**
             * @property width
             * @type number
             */
            width: {
                default: 0,
                type: Fire.Integer,
                readonly: true
            },
            /**
             * @property height
             * @type number
             */
            height: {
                default: 0,
                type: Fire.Integer,
                readonly: true
            },
            /**
             * @property wrapMode
             * @type Texture.WrapMode
             * @default Texture.WrapMode.Clamp
             */
            wrapMode: {
                default: WrapMode.Clamp,
                type: WrapMode,
                readonly: true
            },

            /**
             * @property filterMode
             * @type Texture.FilterMode
             * @default Texture.FilterMode.Bilinear
             */
            filterMode: {
                default: FilterMode.Bilinear,
                type: FilterMode,
                readonly: true
            }
        },
        //onAfterDeserialize: function () {
        //    this.width = this.image.width;
        //    this.height = this.image.height;
        //};
        /**
         * Returns pixel color at coordinates (x, y).
         *
         * If the pixel coordinates are out of bounds (larger than width/height or small than 0),
         * they will be clamped or repeated based on the texture's wrap mode.
         *
         * @method getPixel
         * @param {number} x
         * @param {number} y
         * @return {Fire.Color}
         */
        getPixel: function (x, y) {
            if (!canvasCtxToGetPixel) {
                var canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                canvasCtxToGetPixel = canvas.getContext('2d');
            }
            if (this.wrapMode === Texture.WrapMode.Clamp) {
                x = Math.clamp(x, 0, this.image.width);
                y = Math.clamp(y, 0, this.image.height);
            }
            else if (this.wrapMode === Texture.WrapMode.Repeat) {
                x = x % this.image.width;
                if (x < 0) {
                    x += this.image.width;
                }
                y = y % this.image.width;
                if (y < 0) {
                    y += this.image.width;
                }
            }
            canvasCtxToGetPixel.clearRect(0, 0, 1, 1);
            canvasCtxToGetPixel.drawImage(this.image, x, y, 1, 1, 0, 0, 1, 1);

            var imgBytes = null;
            try {
                imgBytes = canvasCtxToGetPixel.getImageData(0, 0, 1, 1).data;
            }
            catch (e) {
                Fire.error("An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.");
                return Fire.Color.transparent;
            }
            var result = new Fire.Color();
            result.r = imgBytes[0] / 255;
            result.g = imgBytes[1] / 255;
            result.b = imgBytes[2] / 255;
            result.a = imgBytes[3] / 255;
            return result;
        }
    });

    Texture.WrapMode = WrapMode;
    Texture.FilterMode = FilterMode;

    return Texture;
})();
