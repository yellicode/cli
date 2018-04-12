/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as model from "../data-interfaces";
import { UniqueId } from './unique-id';

export class ModelBuilder {
    public static buildSampleModel(modelName: string): model.DocumentData {
        const model: model.ModelData = {
            elementType: "model",
            id: UniqueId.create(),
            name: modelName
        } as model.ModelData;

        model.packagedElements = [ModelBuilder.createSampleClass()];

        return {
            id: UniqueId.create(),
            creator: "Yellicode CLI",
            modelTypeName: "Yellicode YML",
            modelTypeVersion: "0.1.8",
            model: model
        }
    }

     private static createSampleClass(): model.PackageableElementData {
        const sampleClass: model.ClassData = {
            elementType: "class",
            id: UniqueId.create(),
            visibility: "public",
            name: 'Class1',
            ownedComments: ModelBuilder.createComment('This is a sample class.')
        } as model.ClassData;

        // Add an attribute
        const sampleAttribute1: model.PropertyData = {
            elementType: "property",
            id: UniqueId.create(),
            visibility: "public",
            name: 'StringProperty',
            type: 'string_id', // the built-in string type
            ownedComments: ModelBuilder.createComment('This is a sample string property.')
        } as model.PropertyData;

        const sampleAttribute2: model.PropertyData = {
            elementType: "property",
            id: UniqueId.create(),
            visibility: "public",
            name: 'IntCollectionProperty',
            type: 'integer_id', // the built-in int type,
            upperValue: this.createInfiniteUnlimitedNaturalData(),
            ownedComments: ModelBuilder.createComment('This is a sample int collection property.')
        } as model.PropertyData;

        sampleClass.ownedAttributes = [sampleAttribute1, sampleAttribute2];
        return sampleClass;
    }

    private static createComment(body: string): model.CommentData[] | null {
        if (!body || body.length === 0) return null;
        return [{ elementType: "comment", body: body } as model.CommentData];
    }

    private static createInfiniteUnlimitedNaturalData(): model.ValueSpecificationData {
        return { elementType: "literalUnlimitedNatural", value: "*" } as model.LiteralUnlimitedNaturalData;
    }    
}