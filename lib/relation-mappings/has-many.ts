import * as assert from 'assert';
import { camelCase } from 'lodash';
import { Dict } from '../utils';
import { Model as BaseObjectionModel } from 'objection';
import { Container, RelationshipDescriptor } from 'denali';
import ExtendedDenaliModel from '../denali-model';
import ExtendedObjectionModel from '../objection-model';
import { RelationMapping, RelationJoin } from 'objection';
import ObjectionAdapter from '../adapter';

export default function generateHasManyRelationMapping(
  adapter: ObjectionAdapter,
  objectionModels: Dict<typeof ExtendedObjectionModel>,
  container: Container,
  model: typeof ExtendedDenaliModel,
  name: string,
  descriptor: RelationshipDescriptor
): RelationMapping {
  let options = descriptor.options;
  let type = model.getType(container);

  let ObjectionModel = objectionModels[type];
  let RelatedObjectionModel = objectionModels[descriptor.type];

  assert(ObjectionModel, `Unable to find the corresponding Objection model for the Denali "${ type }" model`);
  assert(RelatedObjectionModel, `Unable to find the corresponding Objection model for the Denali "${ descriptor.type }" model`);

  let foreignKeyForRelationship = options.foreignKeyForRelationship ? () => options.foreignKeyForRelationship : adapter.foreignKeyForRelationship;

  let mapping = {
    relation: BaseObjectionModel.HasManyRelation,
    modelClass: RelatedObjectionModel,
    join: <RelationJoin>{
      from: `${ ObjectionModel.tableName }.id`, // i.e. from: 'Post.id'
      to: `${ RelatedObjectionModel.tableName }.${ foreignKeyForRelationship.call(adapter, descriptor) }` // i.e. to: 'Comment.postId'
    }
  };

  return mapping;
}
