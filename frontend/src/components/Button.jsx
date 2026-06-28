function Button({

    text,

    type = "button",

    onClick,

    className = "",

    disabled = false

}){

    return(

        <button

        type={type}

        onClick={onClick}

        disabled={disabled}

        className={`auth-btn ${className}`}

        >

            {text}

        </button>

    );
}

export default Button;