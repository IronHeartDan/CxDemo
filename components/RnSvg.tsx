import React, { useEffect } from 'react';
import { DimensionValue, View } from 'react-native';
import { WebView } from 'react-native-webview';

type RnSvgProps = {
    url: string,
    width: DimensionValue,
    height: DimensionValue
}

const RnSvg: React.FC<RnSvgProps> = ({ url, width, height }) => {

    // useEffect(() => {

    //     return () => {
    //         console.log("Unmounted");
    //     }
    // }, [])

    const html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Svg Image</title>

        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                overflow: hidden;
            }
            body{
                width:100vw;
                height:100vh;
                overflow: hidden;
            }
            img{
                width:100%;
                height:100%;
                object-fit:cover;
            }
        </style>

    </head>

    <body>
        <img src=${url} alt="RnSvg"/>
    </body>

    </html>
    `;

    return (
        <View style={{
            width: width,
            height: height,
        }}>
            <WebView
                overScrollMode='never'
                source={{
                    html: html
                }}
            />
        </View>
    );
};

export default RnSvg;
