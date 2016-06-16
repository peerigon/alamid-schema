Changelog
---------

### 1.1.0
- Add possibility to create empty subsets via `.only()` and `.except()` [(commit)](https://github.com/peerigon/alamid-schema/commit/f6a4a0284e83f6adb40d07dde7434aef5b274f30)

### 1.0.0
- **Breaking:** Remove `Promise` shim. You need to provide that now [(commit)](https://github.com/peerigon/alamid-schema/commit/cb3809c367fd64b47166190422e96b0d14e77000).
- **Breaking:** Renamed readable- and writable-methods [(commit)](https://github.com/peerigon/alamid-schema/commit/80f9a12b9e239e12c857c5b62116a771ecb7b3b3).
- **Breaking:** Change error message casing of default validators from camelCased to dash-cased [(commit)](https://github.com/peerigon/alamid-schema/commit/0deedb47fbb37d4b8672664e61dda82c75a62b9a).
- **Breaking:** Rename `validation.failedFields` to `validation.errors` [(commit)](https://github.com/peerigon/alamid-schema/commit/93c50ed1785f47df5ef6f59c961a9a56a32a3d9b).
- **Breaking:** Do not reject promises when the validation has failed [(commit)](https://github.com/peerigon/alamid-schema/commit/dec6aa1ee4ab06607b33d37371bd9e0697d8e839).
- **Breaking:** Rename `schema.keys` to `schema.fields` [(commit)](https://github.com/peerigon/alamid-schema/commit/6e3da7e26679a6a7698d018fed8cf3c28c2bc8c8).
- Add `minLength`, `maxLength`, `hasLength` validators [(pr)](https://github.com/peerigon/alamid-schema/pull/25).
- Add `matches` validator [(commit)](https://github.com/peerigon/alamid-schema/commit/395607a9ae8fe871df001d4cb5957c69609ea3b9).
- Add `Schema.prototype.strip()` method for removing extranous properties [(commit)](https://github.com/peerigon/alamid-schema/commit/622ce9d000f26240b19082f47c148b5a41d10457).
- The synchronous validation result can now be retrieved synchronously [(commit)](https://github.com/peerigon/alamid-schema/commit/bd4bf324faa503c5e69ba5b4f680bd8edad3d3e5).
