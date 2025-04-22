'use strict';

function CreateEventForm() {
  const [formData, setFormData] = React.useState({
    city: '',
    name: '',
    date: '',
    time: '',
    location: '',
    cost: '',
    contact: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create event');
      }

      const cityParam = encodeURIComponent(formData.city.trim().toLowerCase());
      window.location.href = `/city-exploration?city=${cityParam}`;

    } catch (error) {
      console.error(error);
    }
  };

  const colors = {
    background: '#f6eada',
    card: '#ffffff',
    primary: '#f76c6c',
    text: '#444444',
    border: '#dddddd',
  };

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background,
        fontFamily: "'Segoe UI', sans-serif",
        padding: '20px',
      },
    },
    React.createElement(
      'form',
      {
        onSubmit: handleSubmit,
        style: {
          backgroundColor: colors.card,
          padding: '30px 40px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${colors.border}`,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            marginBottom: '20px',
            textAlign: 'left',
          },
        },
        React.createElement(
          'a',
          {
            href: '/city-exploration',
            style: {
              color: colors.primary,
              fontWeight: 'bold',
              fontSize: '15px',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '5px'
            },
          },
          '← Back to City Exploration'
        )
      ),

      React.createElement(
        'h2',
        {
          style: {
            textAlign: 'center',
            color: colors.primary,
            marginBottom: '25px',
            fontFamily: "'Oleo Script', cursive",
          },
        },
        'Create New Event'
      ),
      [
        ['City', 'city'],
        ['Name', 'name'],
        ['Date', 'date', 'date'],
        ['Time', 'time', 'time'],
        ['Location', 'location'],
        ['Cost', 'cost'],
        ['Contact', 'contact'],
        ['Description', 'description'],
      ].map(([label, name, type = 'text']) =>
        React.createElement(
          'div',
          { key: name, style: { marginBottom: '18px' } },
          React.createElement(
            'label',
            {
              htmlFor: name,
              style: {
                display: 'block',
                fontWeight: '600',
                marginBottom: '6px',
                color: colors.text,
              },
            },
            label
          ),
          React.createElement(name === 'description' ? 'textarea' : 'input', {
            type,
            id: name,
            name,
            value: formData[name],
            onChange: handleChange,
            style: {
              width: '100%',
              padding: '10px 12px',
              fontSize: '15px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              outline: 'none',
              resize: name === 'description' ? 'vertical' : undefined,
              minHeight: name === 'description' ? '80px' : undefined,
            },
          })
        )
      ),
      React.createElement(
        'button',
        {
          type: 'submit',
          style: {
            width: '100%',
            padding: '12px 0',
            backgroundColor: colors.primary,
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px',
          },
        },
        'Create Event'
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(CreateEventForm));