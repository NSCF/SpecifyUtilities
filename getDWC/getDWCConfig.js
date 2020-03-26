const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = function(models, targetCollection) {
  //see https://github.com/sequelize/sequelize/issues/9869 for the issue about includeing attributes
  return {
    //attributes: ['catalogNumber','altCatalogNumber', 'countAmt', 'fieldNumber', 'GUID', 'Remarks'],
    include: [ 
      {
        model: models.CollectingEvent, 
        as: 'collectingEvent',
        //attributes: ['startDate', 'startDatePrecision', 'endDate', 'endDatePrecision','startDateVerbatim', 'endDateVerbatim', 'verbatimDate', 'method', 'remarks', 'stationFieldNumber', 'verbatimLocality'],
        include: [
          {
            model: models.Locality,
            as: 'locality',
            //attributes:['datum', 'elevationAccuracy', 'originalElevationUnit', 'lat1Text', 'long1Text', 'latLongMethod', 'latitude1', 'longitude1', 'localityName', 'maxElevation', 'minElevation', 'namedPlace', 'relationToNamedPlace', 'verbatimElevation', 'verbatimLatitude', 'verbatimLongitude'],
            include: [ 
              {
                model: models.GeoCoordDetail,
                as: 'georefDetails',
                //attributes: ['geoRefAccuracy', 'geoRefAccuracyUnits', 'geoRefDetDate', 'geoRefDetRef', 'geoRefRemarks', 'geoRefVerificationStatus', 'maxUncertaintyEst', 'maxUncertaintyEstUnit', 'noGeoRefBecause', 'protocol', 'source'],
                include: [
                  {
                    model: models.Agent,
                    as: 'geoRefAgent',
                    //attributes: ['firstName', 'lastName', 'initials', 'middleInitial']
                  }
                ]
              }, 
              {
                model:models.Geography,
                as: 'geography', 
                include: [
                  {
                    model: models.GeographyTreeDefItem,
                    as: 'level',
                    attributes: ['name']
                  }
                ]
              } 
            ]
          },
          {
            model: models.Agent, 
            as: 'collectors',
            attributes: ['firstName', 'lastName', 'initials', 'middleInitial']
          }
        ] 
      },
      {
        model: models.Collection,
        as: 'collection',
        //attributes:['code', 'collectionName', 'collectionId', 'guid'],
        where: {
          collectionName: targetCollection
        },
        include: [{
          model: models.Discipline,
          as: 'discipline',
          //attributes: ['disciplineID', 'Name'],
          include: [{
            model: models.Division,
            as: 'division',
            include: [{
              model: models.Institution,
              as: 'institution',
              attributes:['code', 'copyright', 'guid', 'institutionId', 'ipr', 'license', 'name', 'remarks', 'termsOfUse', 'uri']
            }]
          }]
        }]
      }, 
      {
        model: models.Determination,
        as: 'determinations',
        //attributes: ['confidence', 'determinedDate', 'determinedDatePrecision', 'featureOrBasis', 'isCurrent', 'method', 'qualifier', 'remarks', 'typeStatusName'],
        include: [
          {
            model: models.Taxon,
            as: 'dettaxon',
            //attributes: ['taxonID', 'parentID', 'guid', 'name', 'fullName', 'author', 'isAccepted'],
            include: [
              {
                model: models.TaxonTreeDefItem,
                as: 'rank',
                attributes: ["Name"]
              },
              {
                model: models.Taxon,
                as: 'acceptedTaxon', //Specify updates the accepted taxon for chains of synonymy to the current name
                attributes: ['taxonID', 'parentID','guid', 'name', 'fullName', 'author', 'isAccepted'],
              }
            ]
          }, 
          {
            model: models.Agent,
            as: 'determiner',
            attributes: ['firstName', 'lastName', 'initials', 'middleInitial']
          }
        ]
      },
      {
        model: models.Preparation,
        as: 'preparations',
        //attributes:['countAmt'],
        include: [
          {
            model: models.PrepType,
            as: 'type',
            attributes: ['name']
          }, 
          {
            model: models.Attachment,
            as: 'attachments',
            attributes: ['attachmentLocation','mimeType']
          }
        ]
      }, 
      {
        model: models.Attachment,
        as: 'attachments',
        attributes: ['attachmentLocation','mimeType']
      } 
    ]
  }
}
  