const fs = require('fs');
const path = require('path');
const imagemagickCli = require('imagemagick-cli');
const sizeOf = require('image-size');
const execa = require('execa');
const gifsicle = require('gifsicle');
const dlFile = require('../utils/dl-file');
const { escaper } = require('../helpers/global-vars');


const captionGenerator = (buffer, dirPath, ext, captionText) => {
  return new Promise(async (resolve, reject) => {

    dlFile(buffer, dirPath, 'input', ext)
    .then((inputPath) => {
      return generate(inputPath);
    })
    .catch((err) => {
      reject(err);
    })

    function generate(inputPath) {
      const captionPath = path.resolve(dirPath, 'caption.png');
      const imageSize = sizeOf(inputPath);
      const aspectRatio = imageSize.width / imageSize.height;
      const newWidth = 420;
      const newHeight = Math.round(newWidth / aspectRatio)
      imagemagickCli.exec(`convert -background white -interline-spacing 0 -kerning 0 -fill black  -font "./caption-font.otf" -pointsize 36 -size ${newWidth - 50}x -gravity Center  caption:"${captionText}" PNG24:${captionPath}`)
        .then(() => {
          const captionSize = sizeOf(captionPath);
          return imagemagickCli.exec(`convert ${captionPath} -gravity Center -extent ${captionSize.width + 50}x${captionSize.height + 60} PNG24:${captionPath}`)
        }).then(() => {
          const unoptimizedOutputPath = path.resolve(dirPath, `unoptimized-output.${ext}`)
          return imagemagickCli.exec(`convert ${captionPath} -alpha set -background none ${escaper}( ${inputPath} -coalesce -resize ${newWidth}x${newHeight} ${escaper}) -set page "%[fx:u.w]x%[fx:u.h+v.h]+%[fx:t?(u.w-v.w)/2:0]+%[fx:t?u.h:0]" -coalesce null: -insert 1 -layers composite -loop 0 -define colorspace:auto-grayscale=off ${unoptimizedOutputPath}`).then(() => (unoptimizedOutputPath));
        }).then((unoptimizedOutputPath) => {
          const outputPath = path.resolve(dirPath, `output.${ext}`)
          if (ext === 'gif') return execa(gifsicle, ['-O2', '--lossy=100', '-o', outputPath, unoptimizedOutputPath]).then(() => (outputPath));
          return unoptimizedOutputPath;
        }).then((output) => {
          return fs.readFileSync(output);
        }).then((buffer) => {
          resolve(buffer);
        }).catch((err) => {
          reject(err);
        }).finally(() => {
          fs.promises.rmdir(dirPath, {
            recursive: true
          })
        });
    }

  })
}

module.exports = captionGenerator;
