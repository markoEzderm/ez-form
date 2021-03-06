import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement
  //   getByText as getByTextGlobal,
  //   queryByText as queryByTextGlobal
} from "react-testing-library";
import useForm from "../index";
import formElements, {formatDate} from "./formTestElements";

function isRequired({ value, message }) {
  if (!value) {
    return message || "Is required default";
  }
  return "";
}

function isName({ value, message }) {
  if (value && !/^[a-zA-Z]*$/.test(value)) {
    return message || "Is name custom";
  }
  return "";
}

function isMaxLength({ value, args = {} }) {
  if (value && value.length > args.maxLength) {
    return "Max length is " + args.maxLength;
  }
}

function isStartDateBeforeEndDate({ value, args, message }) {
  let endDate = args.depenencyFieldValue;
  if (!endDate) return;

  if (!message) {
    message = "Start date should be before end date";
  }

  if (value && endDate < value) {
    return message;
  }
}

function isEndDateBeforeStartDate({ value, args, message }) {
  let startDate = args.depenencyFieldValue;
  if (!startDate) return;

  if (!message) {
    message = "End date should be after end date";
  }

  if (value && startDate > value) {
    return message;
  }
}

afterEach(cleanup);

describe("Validate form data on input change", () => {
  test("Validate only changed input", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "text1",
          name: "testInputText1",
          validationRules: [
            {
              fn: isRequired
            },
            {
              fn: isName
            }
          ]
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          validationRules: [
            {
              fn: isName,
              message: "Is name custom"
            }
          ]
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);

    const [input1, input2] = container.querySelectorAll("input");
    const [inputWrapper1, inputWrapper2] = container.querySelectorAll(
      ".TestTextInput"
    );

    fireEvent.change(input1, { target: { value: "" } });

    await waitForElement(() => getByValue(""), {
      inputWrapper1
    });

    let errorMessage1 = container.querySelector(".testInputText1 > .Error");
    let errorMessage2 = container.querySelector(".testInputText2 > .Error");

    expect(errorMessage1.innerHTML).toBe("Error: Is required default");
    expect(errorMessage2).toBeNull();

    fireEvent.change(input1, { target: { value: "text" } });
    fireEvent.change(input2, { target: { value: "222" } });

    await waitForElement(() => [getByValue("text"), getByValue("222")], {
      container
    });

    errorMessage1 = container.querySelector(".testInputText1 > .Error");
    errorMessage2 = container.querySelector(".testInputText2 > .Error");

    expect(errorMessage1).toBeNull();
    expect(errorMessage2.innerHTML).toBe("Error: Is name custom");
  });

  test("useForm treat intl error message and string same", async () => {
    // Intl error messages are handled in components from formElemet
    function TestForm() {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "text1",
          name: "testInputText1",
          validationRules: [
            {
              fn: isRequired,
              message: {
                descriptor: {
                  id: "Util.isRequired",
                  defaultMessage: "Is required intl message"
                }
              }
            }
          ]
        }
      });

      return <div>{formData.testInputText1.render()}</div>;
    }

    const { container, getByValue } = render(<TestForm />);
    const input = container.querySelector("input");

    fireEvent.change(input, { target: { value: "" } });
    await waitForElement(() => getByValue(""), {
      container
    });

    let errorMessage = container.querySelector(".Error");
    expect(errorMessage.innerHTML).toBe("Error: Is required intl message");
  });

  test("Args property for validation function", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText: {
          formElement: formElements.textInput,
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3
              }
            }
          ]
        }
      });

      return <div>{formData.testInputText.render()}</div>;
    }

    const { container, getByValue } = render(<TestForm />);

    const [input] = container.querySelectorAll("input");
    const [testInputText] = container.querySelectorAll(".TestTextInput");

    fireEvent.change(input, { target: { value: "text" } });

    await waitForElement(() => [getByValue("text")], {
      container
    });

    let errorMessage = testInputText.querySelector(".Error");
    expect(errorMessage.innerHTML).toBe("Error: Max length is 3");
  });

  test("Validate anoter field", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: "testInputText1",
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3
              }
            },
            {
              validateAnotherField: "testInputText2"
            }
          ]
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          validationRules: [
            {
              fn: isRequired
            }
          ]
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);

    const [input1, input2] = container.querySelectorAll("input");
    const [inputWrapper1, inputWrapper2] = container.querySelectorAll(
      ".TestTextInput"
    );

    fireEvent.change(input1, { target: { value: "Text1" } });

    await waitForElement(() => [getByValue("Text1")], {
      container
    });

    let errorMessage1 = container.querySelector(".testInputText1 > .Error");
    let errorMessage2 = container.querySelector(".testInputText2 > .Error");

    expect(errorMessage1.innerHTML).toBe("Error: Max length is 3");
    expect(errorMessage2.innerHTML).toBe("Error: Is required default");

    fireEvent.change(input1, { target: { value: "t" } });
    fireEvent.change(input2, { target: { value: "text2" } });

    await waitForElement(() => [getByValue("t"), getByValue("text2")], {
      container
    });

    errorMessage1 = container.querySelector(".testInputText1 > .Error");
    errorMessage2 = container.querySelector(".testInputText2 > .Error");

    expect(errorMessage1).toBeNull();
    expect(errorMessage2).toBeNull();
  });

  test.skip("Validate field based on value for another field", async () => {
    function TestForm() {
      const formData = useForm({
        startDate: {
          formElement: formElements.textInput,
          name: "startData",
          validationRules: [
            {
              fn: isStartDateBeforeEndDate,
              args: {
                depenencyFieldName: "endDate"
              }
            }
          ]
        },
        endDate: {
          formElement: formElements.textInput,
          name: "endDate",
          defaultValue: new Date(2017, 12, 31),
        }
      });

      return (
        <div>
          {formData.startDate.render()}
          {formData.endDate.render()}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);
    const [startDateInput] = container.querySelectorAll("input");

    let startDate = new Date();
    fireEvent.change(startDateInput, { target: { value: startDate } });

    await waitForElement(() => getByValue(formatDate(startDate)), {
      container
    });

    let endDateErrorMessage = container.querySelector(".endDate > .Error");
    expect(endDateErrorMessage.innerHTML).toBe("Error: Start date should be before end date");

  });
});
