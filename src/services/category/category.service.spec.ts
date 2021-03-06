import {CategoryService} from "./category.service";
import {Category} from "../model/category";
import {UuidProvider} from "../db/uuid.provider";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";

describe('CategoryService', () =>{
  let dbSpy, querySpy, dbSpyErr, querySpyErr, idSpy, parseDataSpy, getSpy;
  let categoryService: CategoryService;
  let errCategoryService: CategoryService;
  let idProviderSpy: UuidProvider;
  let translateSpy;
  beforeAll(() => {
    const categories = [
        {'category_id': '1', 'category_name': 'example', 'image_file': '', 'is_active': 'true'}
    ];
    const catRes = { res: { rows: categories}};
    const item = jest.fn().mockImplementation((idx: number) => catRes.res.rows[idx]);

    const result = {
      length: catRes.res.rows.length,
      item: item
    };

    querySpy = jest.fn().mockImplementation(() => Promise.resolve(catRes));
    querySpyErr = jest.fn().mockImplementation(() => Promise.reject(false));
    parseDataSpy = jest.fn().mockImplementation(() => result);
    getSpy = jest.fn().mockImplementation((key: string | Array<string>, interpolateParams?: Object) =>
      Observable.create(observer => observer.next(key))
    );
    idSpy = jest.fn().mockImplementation(() => new Date().getTime().toString());
    dbSpy = {
      query: querySpy,
      parseData: parseDataSpy,
      update: jest.fn().mockImplementation(() => Promise.resolve(true))
    };

    dbSpyErr = {
      query : querySpyErr,
      parseData: parseDataSpy,
      update: jest.fn().mockImplementation(() => Promise.reject(false))
    };

    idProviderSpy = {
      id : idSpy
    };

    translateSpy = { get: getSpy };

    categoryService = new CategoryService(dbSpy, idProviderSpy, translateSpy);
    errCategoryService = new CategoryService(dbSpyErr, idProviderSpy, translateSpy);
  });

  it('save new category into db',() => {
    const category = new Category();
    category.categoryName = 'example';
    category.categoryId = 'cat-uuid';
    category.imageFile = 'food.png';
    category.isActive = true;
    const promise = categoryService.save(category);
    expect.assertions(1);
    promise.then(res => expect(res).toBeTruthy());
  });

  it('return validation errors',() => {
    const category = new Category();
    category.categoryName = '';
    category.categoryId = 'cat-uuid';
    category.imageFile = '';
    category.isActive = undefined;
    const promise = categoryService.save(category);
    const errors = [`Category name should not be empty`,
                  `Category should be set as active or inactive`];
    expect.assertions(1);
    promise.catch(err => {
      expect(err).toEqual(errors);
    });
  });

  it('fail on database insert',() => {
    const category = new Category();
    category.categoryName = 'some category';
    category.categoryId = 'cat-uuid';
    category.imageFile = '';
    category.isActive = false;

    const promise = errCategoryService.save(category);

    expect.assertions(1);
    promise.catch(err => {
      expect(err).toEqual(false);
    });
  });

  it('should return categories array in promise', () => {
    expect.assertions(1);
    const category = new Category();
    category.categoryId='1';
    category.categoryName='example';
    const categories = [category];
    const promise = categoryService.findAll();
    promise.then((res) => expect(res).toEqual(categories));
  });

  it(`should have validation errors`, () => {
    const category = new Category();
    category.isActive = undefined;
    const errs = [`Id should not be null`, `Category name should not be empty`,
      `Category should be set as active or inactive`];

    const promise = categoryService.update(category);

    expect.assertions(1);

    promise.catch(res => expect(res).toEqual(errs));
  });


  it(`should update category`, () => {
    const category = new Category();
    category.categoryId = '1';
    category.categoryName = 'example';

    const promise = categoryService.update(category);

    expect.assertions(1);
    promise.then(res => expect(res).toEqual(category));
  });

});
