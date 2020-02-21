import React from "react";
import { shallow, configure, mount } from "enzyme";
import "@testing-library/jest-dom/extend-expect";
import Adapter from "enzyme-adapter-react-16";

import "@testing-library/jest-dom/extend-expect";

import CropComponent from "../CropComponent";
import * as cropComponent from "../CropComponent";
import testPictureBig from "./testPictureBig.jpg";
import testPictureSmall from "./testPictureSmall.jpg";

configure({ adapter: new Adapter() });

let file = new File([""], "fileName");
let newFile = new File(["new", "new"], "newFileName");

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

describe("cropComponent tests..", () => {
  it("test CropComponent exists..", () => {
    const wrapper = shallow(<CropComponent />);

    expect(wrapper.find('[data-testid="cropComponent"]')).toHaveLength(1);
  });

  it("test transformImage function - input string, File, base64 - output string..", () => {
    //test for Image
    const resultImage = cropComponent.transformImage(testPictureBig);
    expect(typeof resultImage).toBe("string");
    //test for file
    global.URL.createObjectURL = jest.fn(() => "string"); //issue miatt kell mockolni :https://github.com/plotly/react-plotly.js/issues/115
    const resultFile = cropComponent.transformImage(file);
    expect(typeof resultFile).toBe("string");
    //test for base64

    toBase64(file).then(result => {
      const resultBase64 = cropComponent.transformImage(result);
      expect(typeof resultBase64).toBe("string");
    });
  });

  it("test state image and imageAsFileIfPropsIsFile if props.image are string, File? base64 ..", () => {
    const wrapper = shallow(<CropComponent image={file} />);
    expect(typeof wrapper.state().image).toBe("string");
    expect(typeof wrapper.state().imageAsFileIfPropsIsFile).toBe("object");

    const wrapper2 = shallow(<CropComponent image={testPictureBig} />);
    expect(typeof wrapper2.state().image).toBe("string");
    expect(wrapper2.state().imageAsFileIfPropsIsFile).toBe(null);

    toBase64(file).then(result => {
      const wrapper3 = shallow(<CropComponent image={result} />);
      expect(typeof wrapper3.state().image).toBe("string");
      expect(wrapper3.state().imageAsFileIfPropsIsFile).toBe(null);
    });
  });

  describe("test getDerivedStateFromProps function ..", () => {
    it("component gets File and then a different File, test state.imageAsFileIfPropsIsFile.name change..", () => {
      const wrapper = shallow(<CropComponent image={file} />);
      expect(typeof wrapper.state().image).toBe("string");
      expect(typeof wrapper.state().imageAsFileIfPropsIsFile).toBe("object");
      expect(wrapper.state().imageAsFileIfPropsIsFile.name).toBe("fileName");
      wrapper.setState({ crop: 10, percentCrop: 20 });

      wrapper.setProps({ image: newFile });
      expect(wrapper.state().imageAsFileIfPropsIsFile.name).toBe("newFileName");
      expect(wrapper.state().crop).toBe(null);
      expect(wrapper.state().percentCrop).toBe(null);
    });

    it("test component get image and then image again, test state.image changing ..", () => {
      const wrapper = shallow(<CropComponent image={testPictureBig} />);
      expect(wrapper.state().image).toBe(testPictureBig);
      expect(wrapper.state().imageAsFileIfPropsIsFile).toBe(null);

      wrapper.setProps({ image: testPictureSmall });
      expect(wrapper.state().image).toBe(testPictureSmall);
    });
  });
});
