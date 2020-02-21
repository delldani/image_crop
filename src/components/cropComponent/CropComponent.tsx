import React, { SyntheticEvent } from "react";
import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function urlToImage(imageUrl: string) {
  let image = new Image();
  image.onload = function() {};
  image.src = imageUrl;
  return image;
}

function blobToFile(theBlob: Blob, fileName: string): File {
  return new File([theBlob], fileName);
}

export function transformImage(image: File | string) {
  if (typeof image === "object") return URL.createObjectURL(image);
  return image;
}

export function getCroppedImageFromComponent(
  crop: PercentCrop,
  fileName: string,
  sourcePicture: HTMLImageElement
): Promise<File | undefined> {
  const canvas = document.createElement("canvas");

  if (crop.x && crop.y && crop.width && crop.height) {
    const X = sourcePicture.naturalWidth * (crop.x / 100);
    const Y = sourcePicture.naturalHeight * (crop.y / 100);
    const Width = sourcePicture.naturalWidth * (crop.width / 100);
    const Height = sourcePicture.naturalHeight * (crop.height / 100);

    const scaleX = sourcePicture.naturalWidth / sourcePicture.width;
    const scaleY = sourcePicture.naturalHeight / sourcePicture.height;
    canvas.width = Width;
    canvas.height = Height;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    ctx &&
      ctx.drawImage(
        sourcePicture,
        X * scaleX,
        Y * scaleY,
        Width * scaleX,
        Height * scaleY,
        0,
        0,
        Width,
        Height
      );
  }

  // As Base64 string
  //   const base64Image = canvas.toDataURL("image/jpeg");

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        let file;
        if (blob) file = blobToFile(blob, fileName);
        resolve(file);
      },
      "image/jpeg",
      1
    );
  });
}

type MyProps = {
  /**You can pass the image to the component as File, base64 string or source path.
   * e.g. from an imput filed => e.target.files[0]
   */
  image: File | string;
  /**After the cropping process is finished, you can get the result picture as File, and you can
   * set the filename parameter of the File with this prop
   */
  cropedFileName: string;
  /**Inline styles object to be passed to the image element */
  imageStyle?: object;
  /**This event is called if the image had an error loading. */
  onImageError: (e: SyntheticEvent) => void;
  /**With thie callback, you can get the cropped picture.. */
  getCroppedImage: (resultImage: File | undefined) => void;
  /**You can get the size of the cropped area, as an object, First parameter as coordinates, the second as percentage*/
  getCropSize: (Corp: Crop, percentCrop: Crop) => void;
};
type MyState = {
  image: string;
  imageAsFileIfPropsIsFile: File | null;
  crop: Crop | null;
  percentCrop: PercentCrop | null;
};

/**
 * The component can display and crop an image. It's a wrapper for 'react-image-crop' library : https://www.npmjs.com/package/react-image-crop/v/6.0.7
 */
class CropComponent extends React.Component<MyProps, MyState> {
  constructor(props: MyProps) {
    super(props);
    this.onComplete = this.onComplete.bind(this);
    this.state = {
      image: transformImage(props.image),
      imageAsFileIfPropsIsFile:
        typeof props.image === "object" ? props.image : null,
      crop: null,
      percentCrop: null
    };
  }

  static defaultProps = {
    cropedFileName: "cropedFile",
    isCropedImageBack: true,
    onImageError: (event: SyntheticEvent) => {
      console.log("Hibás File");
      console.log(event);
    },
    getCroppedImage: (resultImage: File | undefined) => {
      console.log("Eredmény kép :");
      console.log(resultImage);
    },
    getCropSize(Crop: Crop, percentCrop: PercentCrop) {
      console.log("Corp koordinátákkal megadva : ");
      console.log(Crop);
      console.log("Corp százalékkal megadva : ");
      console.log(percentCrop);
    }
  };

  onComplete(newCorp: Crop, percentCrop: PercentCrop) {
    //az első renderelés után is lefut ez a függvény csak (0,0)-val,ami miatt a getCroppedImageFromComponent undefined-et ad vissza
    //ha csak klikkelés van és nincs kijelölés akkor is (0,0) az (x,y)ami lefutattva a getCroppedImageFromComponent-ben szintén undefined
    const { cropedFileName, getCropSize, getCroppedImage } = this.props;
    getCropSize(newCorp, percentCrop);
    getCroppedImageFromComponent(
      percentCrop,
      cropedFileName,
      urlToImage(this.state.image)
    ).then(resultPicture => {
      if (newCorp.width || newCorp.height) getCroppedImage(resultPicture);
    });
  }

  //URL.createObjectURL() mindíg úja értéket ad vissza, ha újra hívjuk
  // ha nem a constructor-ban van (a transformImage() -ben van benne) akkor azt okozza hogy folyamatosan újrarenderelődik a komponens,ha viszont
  //a konstruktorban van akkor
  //ha új kép töltődik be akkor viszont nem frissíti a képet. Ezért létre van hozva a imageAsFileIfPropsIsFile
  //property a state-ben ami null ha eredetileg stringet adnak meg, ha viszont file-t akkor az eredeti fájl van benne
  //A getDerivedStateFromProps megvizsgálja hogy történt e változás a props-ban lett e új kép megadva..
  // és ha igen frissíti a state-et

  static getDerivedStateFromProps(props: MyProps, state: MyState) {
    const isFileOrString = state.imageAsFileIfPropsIsFile
      ? props.image !== state.imageAsFileIfPropsIsFile
      : props.image !== state.image;
    if (isFileOrString) {
      return {
        image: transformImage(props.image),
        imageAsFileIfPropsIsFile:
          typeof props.image === "object" ? props.image : null,
        crop: null,
        percentCrop: null
      };
    }

    return null;
  }

  render() {
    const { onImageError, imageStyle } = this.props;
    const { image, crop } = this.state;

    return (
      <div>
        <ReactCrop
          data-testid="cropComponent"
          src={image}
          crop={crop ? crop : undefined}
          imageStyle={imageStyle}
          onChange={(newCrop: Crop, percentCrop: PercentCrop) => {
            this.setState({
              crop: newCrop,
              percentCrop: percentCrop
            });
          }}
          onComplete={this.onComplete}
          onImageError={(e: SyntheticEvent) => {
            onImageError(e);
          }}
          //lenullázza az imageDisplaySizeInState-et hogy hiba esetén ne legyen kinnt egy üres mező a default-size alapján
        />
      </div>
    );
  }
}

export default CropComponent;
