'use strict';

const Fs = require('fire-fs');
const Path = require('fire-path');
const Plist = require('plist');
const SpriteMeta = require('./sprite');

const BRACE_REGEX = /[\{\}]/g;

class SpriteAtlasMeta extends Editor.metas.asset {
  constructor ( assetdb ) {
    super( assetdb );
    this.rawTexturePath = '';
    this.rawTextureUuid = '';
    this.size = cc.size(0, 0);
    this.type = '';
  }

  static validate ( assetpath ) { return false; }

  static defaultType() { return 'sprite-atlas'; }

  parse () {}

  useRawfile () { return false; }

  deserialize ( jsonObj ) {
    super.deserialize(jsonObj);

    var subMetas = {}, 
        metaData, meta, key,
        fspath = this._assetdb.uuidToFspath(jsonObj.uuid);
    for (key in jsonObj.subMetas) {
      metaData = jsonObj.subMetas[key];
      meta = subMetas[key] = new SpriteMeta( this._assetdb );
      meta.deserialize( metaData );
    }

    this.updateSubMetas( subMetas );

    // Overwrite sub metas' import function
    var subMetas = this.getSubMetas();
    for ( var key in subMetas ) {
      subMetas[key].import = this.importSprite;
    }
  }

  dest () {
    return [
      this._assetdb._uuidToImportPathNoExt( this.uuid ) + '.json',
    ];
  }

  importSprite ( fspath, cb ) {
    var sprite = this.createSpriteFrame( fspath, this._rawWidth, this._rawHeight );

    // TODO: this.atlasName

    this._assetdb.saveAssetToLibrary( this.uuid, sprite );

    if (cb) cb( null, sprite );
  }

  import ( fspath, cb ) {
    // Copy source file
    this._assetdb.copyAssetToLibrary( this.uuid, fspath );

    this.parse( fspath );

    // Overwrite sub metas' import function
    var subMetas = this.getSubMetas();
    for ( var key in subMetas ) {
      subMetas[key].import = this.importSprite;
    }

    if (cb) cb();
  }
}

module.exports = SpriteAtlasMeta;
