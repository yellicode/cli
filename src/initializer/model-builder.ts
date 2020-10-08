/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as elements from '../data-interfaces';
import { UniqueId } from '@yellicode/core';

export class ModelBuilder {
    public static buildSampleModel(modelName: string): elements.DocumentData {
        const modelData: elements.ModelData = {
            elementType: "model",
            id: UniqueId.create(6),
            name: modelName
        } as elements.ModelData;

        modelData.packagedElements = [ModelBuilder.createSampleClass()];

        return {
            id: UniqueId.create(6),
            creator: "Yellicode CLI",
            modelTypeName: "Yellicode YML",
            modelTypeVersion: elements.MetaVersion,
            model: modelData
        }
    }

     private static createSampleClass(): elements.PackageableElementData {
        const sampleClass: elements.ClassData = {
            elementType: "class",
            id: UniqueId.create(6),
            visibility: "public",
            name: 'Class1',
            ownedComments: ModelBuilder.createComment('This is a sample class.')
        } as elements.ClassData;

        // Add an attribute
        const sampleAttribute1: elements.PropertyData = {
            elementType: "property",
            id: UniqueId.create(),
            visibility: "public",
            name: 'StringProperty',
            type: 'string_id', // the built-in string type
            ownedComments: ModelBuilder.createComment('This is a sample string property.')
        } as elements.PropertyData;

        const sampleAttribute2: elements.PropertyData = {
            elementType: "property",
            id: UniqueId.create(),
            visibility: "public",
            name: 'IntCollectionProperty',
            type: 'integer_id', // the built-in int type,
            upperValue: this.createInfiniteUnlimitedNaturalData(),
            ownedComments: ModelBuilder.createComment('This is a sample int collection property.')
        } as elements.PropertyData;

        sampleClass.ownedAttributes = [sampleAttribute1, sampleAttribute2];
        return sampleClass;
    }

    private static createComment(body: string): elements.CommentData[] | null {
        if (!body || body.length === 0) return null;
        return [{ elementType: "comment", body: body } as elements.CommentData];
    }

    private static createInfiniteUnlimitedNaturalData(): elements.ValueSpecificationData {
        return { elementType: "literalUnlimitedNatural", value: "*" } as elements.LiteralUnlimitedNaturalData;
    }
}