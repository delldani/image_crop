import React from "react";

import { CropComponent } from "./components";
import kep from "./1.jpg";
import kep2 from "./555.jpg";

const toBase64 = (file: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

type MyState = {
  file: any;
  resultImage: any;
};
type MyProps = {};

class App extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.getCroppedImage = this.getCroppedImage.bind(this);
    this.state = { file: null, resultImage: null };
  }

  async onChange(e: any) {
    // toBase64(e.target.files[0]).then(res => {
    //   this.setState({ file: res });
    //   console.log(res);
    // });

    // this.setState({ file: kep });
    // console.log(kep);

    this.setState({ file: e.target.files[0] });
    console.log(e.target.files[0]);
  }

  getCroppedImage(resultImageFromComponent: File | undefined) {
    if (resultImageFromComponent)
      this.setState({
        resultImage: URL.createObjectURL(resultImageFromComponent)
      });
  }

  render() {
    const { file, resultImage } = this.state;
    return (
      <div>
        <input data-testid="input" onChange={this.onChange} type="file"></input>
        <div data-testid="cropimage">
          {this.state.file ? (
            <CropComponent
              getCroppedImage={this.getCroppedImage}
              image={file}
              imageStyle={{ height: "400px", width: "300px" }}
            />
          ) : (
            <p>kép helye</p>
          )}
        </div>

        {resultImage ? (
          <img data-testid="resultimage" src={resultImage} alt="as" />
        ) : null}
      </div>
    );
  }
}

export default App;
