function Input({

    label,

    type="text",

    placeholder,

    value,

    onChange,

    name

}){

    return(

        <div className="form-group">

            <label>{label}</label>

            <input

            className="form-control"

            type={type}

            placeholder={placeholder}

            value={value}

            onChange={onChange}

            name={name}

            />

        </div>

    );
}

export default Input;