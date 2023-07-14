<h1 align="center">
  @traent/ngx-paginator
</h1>

<p align="center">
  <img width="250px" height="auto" src="https://traent.com/wp-content/uploads/2022/07/logo-color.svg">
</p>

<br />

> @traent/ngx-paginator is an Angular library for managing some use cases about pagination, wrapping common patterns in shared components and classes.

> Notice: This library is currently under development and might be subjected to breaking changes. We also plan to move it inside [@traent/ngx-components](https://github.com/traent/ngx-components).

## Compatibility with Angular Versions

| @traent/ngx-paginator | Angular        |
| --------------------- | -------------- |
| 0.0.x                 | 14             |

## Installation

You can install it through **NPM**:

```bash
npm install @traent/ngx-paginator
```

When you install using **npm**, you will also need to import `NgxT3PaginatorModule` in your `app.module`:

```typescript
import { NgxT3PaginatorModule } from '@traent/ngx-paginator';

@NgModule({
  imports: [NgxT3PaginatorModule],
})
class AppModule {}
```

## API & Examples

The example app can be launched using `npm run serve:example`.

Please note that the `example-app` depends from `@traent/design-system` and in particular from its `fonts.scss` and `material/theme` configurations and styles.

In it, you can find a simple usage of the component `ngx-t3-paginator-list` that is used to show paginated lists.

## Building & Publishing

The building and publishing of this library to NPM is performed through an internal Organization flow that uses the standard Angular approach.

In the future, we will improve the tooling to allow everyone to build this library easily.

## License

`@traent/ngx-paginator` is available under the Apache-2 license. See the [LICENSE](./LICENSE) file for more info.

## Contributors

We are open to any contributions and feedbacks.
