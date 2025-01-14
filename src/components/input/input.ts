import Block, { Props } from '@/core/Block'
import './input.css'

// language=hbs
const inputTemplate: string = `
    <label class="label {{className}}" for="{{name}}">
        <span>{{ label }}</span>
        {{{ input }}}
        <span class="error">{{ errorText }}</span>
    </label>
`

type InputValidation = {
  required?: boolean
  regExp?: RegExp
  errorText?: string
}

type InputProps = {
  name: string
  type: 'text' | 'password' | 'submit'
  label: string
  placeholder?: string
  value?: string
  className?: string
  classNameInput?: string
  validation?: InputValidation
} & Props

export default class Input extends Block {
  _name: string
  _inputElement: InputField
  _validation: InputValidation | undefined

  constructor(props: InputProps) {
    const input = new InputField({ ...props })
    super({
      ...props,
      input: input,
    })
    input.props._parentBlock = this
    this._name = props.name
    this._inputElement = input
    this._validation = props.validation
  }

  componentDidUpdate(oldProps: Props, newProps: Partial<Props>): boolean {
    if (this._inputElement.getValue()) {
      this._inputElement.setProps({
        ...newProps,
        value: this._inputElement.getValue(),
      })
    } else {
      this._inputElement.setProps(newProps)
    }
    return super.componentDidUpdate(oldProps, newProps)
  }

  get name() {
    return this._name
  }

  getValue() {
    return this._inputElement.getValue()
  }

  setValue(value: string) {
    this._inputElement.setValue(value)
  }

  validate() {
    return this._inputElement.validate()
  }

  showError(error: string) {
    this.props.errorText = error
  }

  render() {
    return this.compile(inputTemplate, this.props)
  }
}

// language=hbs
const inputFieldTemplate: string = `
    <input class="input {{classNameInput}}"
           id="{{name}}"
           name="{{name}}"
           type="{{type}}"
           placeholder="{{placeholder}}"
           value="{{value}}"
    />
`

class InputField extends Block {
  _validation?: InputValidation

  constructor(props: Omit<InputProps, 'label' | 'className'>) {
    super({
      ...props,
      events: {
        blur: () => {
          this.validate()
          this.toggleErrorClass()
        },
      },
    })
    if (props.validation) {
      this._validation = props.validation
    }
  }

  getValue() {
    const element = this.element as HTMLInputElement
    return element.value
  }

  setValue(value: string) {
    const element = this.element as HTMLInputElement
    element.value = value
  }

  toggleErrorClass() {
    this.element.classList.toggle('input_error', !this.validate())
  }

  validate() {
    const parent = this.props._parentBlock as Input
    const value = this.getValue()

    if (!this._validation) {
      return true
    }

    if (this._validation.required && !value.length) {
      parent.props.errorText = 'Необходимо заполнить это поле'
      return false
    } else if (
      this._validation.regExp &&
      !this._validation.regExp.test(value)
    ) {
      parent.props.errorText = this._validation.errorText
      return false
    }

    parent.props.errorText = ''
    return true
  }

  render() {
    return this.compile(inputFieldTemplate, this.props)
  }
}
