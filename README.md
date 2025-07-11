# @averay/twing-intl

A [Twing](https://gitlab.com/nightlycommit/twing) extension to simplify using [FormatJS](https://formatjs.github.io/) in templates.

## Usage

### Setup

Create an extension instance with all supported FormatJS intl instances, then add it to a Twing instance:

```ts
// 1. Create Twing environment
import { createEnvironment } from 'twing';
const twingEnvironment = createEnvironment(/* ... */);

// ...

// 2. Create FormatJS intl objects
import { createIntl, type IntlShape } from '@formatjs/intl';

const defaultLocale = 'en-AU';
const intls: IntlShape[] = [
  createIntl({ locale: defaultLocale /* ... */ }),
  // Additional supported locales
];

// ...

// 3. Configure extension and assign to Twing instance
import { TwingIntlExtension } from '@averay/twing-intl';

const extension = new TwingIntlExtension(intls, defaultLocale);
extension.applyToEnvironment(environment); // Cannot use `environment.addExtension(...)`
```

Note the extension cannot be added using `environment.addExtension(extension)` due to limitations with Twing’s extensions API [(see related issue)](https://gitlab.com/nightlycommit/twing/-/issues/636). The method `extension.applyToEnvironment(environment)` must be used instead.

### Messages

For simple messages, a `_` function is provided:

```twing
{# A message with no arguments, e.g. `{ "home.title": "Hello World" }` #}
<h1>{{ _({ id: 'home.title' }) }}</h1>
{# Produces `<h1>Hello World</h1>` #}

{# A message with arguments, e.g. `{ "home.message": "Welcome {title}." }` #}
<p>{{ _({ id: 'home.message' }, { title: user.name }) }}</p>
{# Produces `<p>Welcome Example User.</p>` for context `{ user: { name: "Example User" } }` #}

{# A message in a specific locale #}
<h1>{{ _({ id: 'home.title' }, locale = 'ja-JP') }}</h1>
```

This shortcut function’s name can be customised using the extension’s constructor options argument.

For complex messages, a `message` tag is provided to allow declaring fragments for use in rich-text formatting:

```twig
{# A message with a simple argument, e.g. `{ "home.reference": "Please visit {link}." }` #}
<p>
  {%- message { id: 'home.reference' } -%}
    {%- fragment link -%}
      <a href="https://www.example.com/">example.com</a>
    {%- endfragment link -%}
  {%- endmessage -%}
</p>
{# Produces `<p>Please visit <a href="https://www.example.com/">example.com</a>.</p>` #}

{# A message with a wrapping FormatJS tag, e.g. `{ "home.cta": "To learn more <link>visit our homepage</link>." }` #}
<p>
  {%- message { id: 'home.cta' } -%}
    {%- fragment link(label) -%}
      <a href="https://www.example.com/">{{ label }}</a>
    {%- endfragment link -%}
  {%- endmessage -%}
</p>
{# Produces `<p>To learn more <a href="https://www.example.com/">visit our homepage</a>.</p>` #}
```

For convenience, both the function block support providing a message ID directly in addition to a message descriptor:

```twig
<p>{{ _('example-message') }}</p>
<p>{{ _({ id: 'example-message' }) }}</p>

{% message 'example-message' %}...{% endmessage %}
{% message { id: 'example-message' } -%}...{% endmessage %}
```

### Formatters

To directly format values outside a message, the following filters are provided:

- `intl_date` (Corresponds to [FormatJS’s `formatDate` formatter](https://formatjs.github.io/docs/intl#formatdate))
- `intl_time` (Corresponds to [FormatJS’s `formatTime` formatter](https://formatjs.github.io/docs/intl#formattime))
- `intl_relative_time` (Corresponds to [FormatJS’s `formatRelativeTime` formatter](https://formatjs.github.io/docs/intl#formatrelativetime))
- `intl_number` (Corresponds to [FormatJS’s `formatNumber` formatter](https://formatjs.github.io/docs/intl#formatnumber))
- `intl_plural` (Corresponds to [FormatJS’s `formatPlural` formatter](https://formatjs.github.io/docs/intl#formatplural))
- `intl_list` (Corresponds to [FormatJS’s `formatList` formatter](https://formatjs.github.io/docs/intl#formatlist))
- `intl_display_name` (Corresponds to [FormatJS’s `formatDisplayName` formatter](https://formatjs.github.io/docs/intl#formatdisplayname))
- `intl_message` (Corresponds to [FormatJS’s `formatMessage` formatter](https://formatjs.github.io/docs/intl#formatmessage))

Each filter accepts the same values as its corresponding FormatJS formatter.

```twig
<p>{{ ['one', 'two', 'three'] | intl_list({ type: 'disjunction' }) }}</time>
<p>{{ 123 | intl_number({ style: 'currency', currency: 'AUD' }) }}</p>
```

As [FormatJS’s `formatDateTimeRange` formatter](https://formatjs.github.io/docs/intl#formatrelativetime) accepts two values, its corresponding `intl_date_time_range` filter receives both dates together:

```twig
{# Date range as a tuple #}
<p>{{ [date_from, date_to] | intl_date_time_range }}</p>

{# Date range as an object #}
<p>{{ { from: date_from, to: date_to } | intl_date_time_range }}</p>
```

### Miscellaneous

A `locale` block is available to use a different locale for a section:

```twig
{% locale 'ja-JP' %}
  {# This message will use the `ja-JP` locale. #}
  {{ _('example-message') }}

  {# This date will be formatted in the `ja-JP` locale. #}
  <p>{{ now | intl_date }}</p>
{% endlocale %}

{# This message will use the extension's default locale. #}
{{ _('example-message') }}

{# This date will be formatted in extension's default locale. #}
<p>{{ now | intl_date }}</p>
```

For any other intl usage, an `intl` function is provided to directly access the inner [`IntlShape`](https://formatjs.github.io/docs/intl#intlshape) instances:

```twig
{# Use inferred locale from context #}
<code>{{ intl().formatDisplayName('UN', { type: 'region' }) }}</code>

{# Use specific locale #}
<code>{{ intl('ja-JP').formatDisplayName('UN', { type: 'region' }) }}</code>
```

This function is used internally by all other functions, tags & filters to retrieve the appropriate `IntlShape` instance.

### Lazy-Loading Locales

Instead of an array of `IntlShape` instances, a function conforming to [`TwingIntlProvider`](./lib/types.ts) can be passed to the extension constructor to support custom logic on each access of a specific locale. The implementation will be responsible for any caching.

---

[MIT Licenced](./LICENCE)
