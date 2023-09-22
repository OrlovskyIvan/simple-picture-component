import PropTypes from 'prop-types';
import { styled } from "styled-components";
import { breakpoints } from '../data/constants';

const Img = styled.img`
	${({ $cssmediastr }) => $cssmediastr}
`

const formatNumbers = {
	avif: 0,
	webp: 1,
	jpeg: 2
}

const Picture = ({ defaultImage, data, styles }) => {
	const dataLength = data.length;
	/* Копируем объект со styled брейкпоинтами */
	const breakpointsCopy = {...breakpoints};
	/* Шаблон <source> элементов */
	let sourcesTemplate = [];
	/* Строка стилей для формирования медиа-брейкпоинтов */
	let cssMediaStr = ``;
	
	/* Сортируем массив с картинками по брейкпоинтам от большего к меньшему,
	потому что <source> элементы в шаблоне заполняются от большего
	значения min-width к меньшему, так как это mobile first. */
	const sortedData = data.sort((a, b) => {
		const getCompareValueAndSaveCustomBreakpoint = (dataObj) => {
			/* Берем из объекта брейкопинта название брейкпоинта
			и ширину кастомного брейкпоинта */
			const { bp, widthMedia } = dataObj;
			let compareValue;
			
			/* Если это кастомный брейкпоинт */
			if (widthMedia) {
				/* Записываем в объект с брейкпоинтами новый брейкпоинт
				в формате '768px: 768px' */
				breakpointsCopy[widthMedia] = widthMedia;
				/* В переменную для сравнения записываем ширину кастомного брейкпоинта */
				compareValue = widthMedia;
			} else {
				/* Если это обычный брейкпоинт, в переменную для сравнения записываем
				значение обычного брейкпоинта */
				compareValue = breakpoints[bp];
			}
			
			/* Возвращаем значение брейкпоинта без px в формате '768' */
			return compareValue.slice(0, compareValue.length - 2);
		}
		
		/* Отправляем в функцию объекты и сравниваем полученные значения брейкпоинтов */
		return getCompareValueAndSaveCustomBreakpoint(b) - getCompareValueAndSaveCustomBreakpoint(a);
	});
	
	/* Формируем шаблон <source> элементов */
	sortedData.forEach((breakpointObject, breakpointObjectNumber) => {
		const { bp, width, widthMedia } = breakpointObject;
		/* Если это кастомный брейкпоинт, достаем из объекта брейкпоинтов
		его значение, записанного туда по ключу widthMedia. Если нет,
		достаем значение обычного брейкпоинта. */
		const breakpointSize = widthMedia ? breakpointsCopy[widthMedia] : breakpointsCopy[bp];
		/* Формируем строку стилей с брейкпоинтами */
		cssMediaStr = `${breakpointObjectNumber === dataLength - 1 ? `width: ${width}px; ` : '' }@media (min-width: ${breakpointSize}) { width: ${width}px; } ${cssMediaStr}`;
		
		/* Проходим по объекту брейкпоинта */
		for (let breakpointObjectKey in breakpointObject) {
			/* Берем значение свойства объекта брейкпоинта */
			const breakpointObjectValue = breakpointObject[breakpointObjectKey];
			
			/* Если это массив с картинками для какого-либо формата,
			формируем из него <source> */
			if (typeof breakpointObjectValue === 'object') {
				/* Каждому формату изображения соответствует свой номер,
				это сделано для того, чтобы удобно расположить <source>
				элементы на своих местах в шаблоне. Номера находятся
				в константе formatNumbers. */
				const formatNumber = formatNumbers[breakpointObjectKey];
				/* Номер, куда записывается <source> элемент в шаблоне 
				определяется следующим образом. Номер формата умножается
				на длину массива с брейкпоинтами, так определятся кластер
				формата в шаблоне. К этому числу прибавляется номер брейкпоинта
				в массиве, так определяется номер элемента в кластере и в массиве
				в целом. То есть, формат avif имеет уникальный номер 0, длина
				массива с брейкпоинтами 3. Значит 0 * 3 = 0, с этого места
				начинается кластер <source> элементов с avif форматом. Всего
				в массиве будет 9 элементов. Если это первый элемент массива
				с брейкпоинтами, то breakpointObjectNumber будет равен 0,
				и 1-й <source> элемент будет записан в 0 свойство массива.
				Так как массив отсортирован по брейкпоинтам от меньшего к большему,
				то <source> элементы будут заполняться по порядку в каждом
				кластере: 1) avif1,,,,,,,, 2) avif1,,,webp1,,,,,
				3) avif1,,,webp1,,,jpeg1,,, 4) avif1,avif2,,webp1,,,jpeg1,,,
				и т. д. .  */
				const numberOfSourceInTemplate = formatNumber * dataLength + breakpointObjectNumber;
				/* Значение плотности пикселей для строки srcset: 
				img1x.jpg 1x, img2x.jpg 2x */
				let pixelDensityDescriptor = 1;
				let srcsetStr = ``;
				
				/* Формируем строку srcset из массива с картинками для
				конкретного <source> */
				breakpointObjectValue.forEach((imgSourceStr, i) => {
					srcsetStr = `${srcsetStr}${imgSourceStr} ${pixelDensityDescriptor}x${i === breakpointObjectValue.length - 1 ? '' : ', '}`;
					pixelDensityDescriptor++;
				});
				
				/* Формируем <source> элемент, не задаем свойство
				media для последнего элемента, чтобы нужные картинки
				отрисовывались для последнего брейкпоинта и остальных
				разрешений больше этого брейкпоинта */
				const source = <source
					key={`${breakpointObjectKey}${breakpointObjectNumber}`}
			        type={`image/${breakpointObjectKey}`}
			        srcSet={srcsetStr}
			        {...(breakpointObjectNumber === dataLength - 1 ? {} : { media: `(min-width: ${breakpointSize})` })}
		    	/>
		    	
				sourcesTemplate[numberOfSourceInTemplate] = source;
			}
		}
	})
	
	return (
		<picture>
			{sourcesTemplate}
			<Img
				src={defaultImage}
				$cssmediastr={cssMediaStr}
				style={styles}
			/>
		</picture>
	)
}

Picture.propTypes = {
	defaultImage: PropTypes.string.isRequired,
	data: PropTypes.arrayOf(
		PropTypes.shape({
			bp: PropTypes.string.isRequired,
			width: PropTypes.number.isRequired,
			widthMedia: PropTypes.string,
			avif: PropTypes.arrayOf(PropTypes.string).isRequired,
			webp: PropTypes.arrayOf(PropTypes.string).isRequired,
			jpeg: PropTypes.arrayOf(PropTypes.string).isRequired,
		}),
	),
	styles: PropTypes.objectOf(PropTypes.string),
}

export default Picture;

/*
Компонент расчитан на разработку приложения, используя
технику mobile-first.

1) Дефолтную картинку нужно передавать в свойство defaultImage.
Массив с картинами и брейкпоинтами нужно передавать
в свойство data в следующем формате:
[
	{
		bp: 'sm', width: 200,
		avif: [img200avif, img400avif, img600avif],
		webp: [img200webp, img400webp, img600webp],
		jpeg: [img200jpg, img400jpg, img600jpg],
	},
	{
		bp: 'md', width: 300,
		avif: [img300avif, img600avif, img900avif],
		webp: [img300webp, img600webp, img900webp],
		jpeg: [img300jpg, img600jpg, img900jpg],
	},
	{
		bp: 'lg', width: 400,
		avif: [img400avif, img800avif, img1200avif],
		webp: [img400webp, img800webp, img1200webp],
		jpeg: [img400jpg, img800jpg, img1200jpg],
	},
]

2) Можно менять местами брейкпоинты и массивы
с картинками, ошибки не будет, <source> элементы
будут отрендерены правильно.

[
	{
		bp: 'lg', width: 400,
		webp: [img400webp, img800webp, img1200webp],
		avif: [img400avif, img800avif, img1200avif],
		jpeg: [img400jpg, img800jpg, img1200jpg],
	},
	{
		bp: 'md', width: 300,
		jpeg: [img300jpg, img600jpg, img900jpg],
		avif: [img300avif, img600avif, img900avif],
		webp: [img300webp, img600webp, img900webp],
	}
]

3) Можно добавить кастомный брейкпоинт вот так.
Свойство bp в кастомном брейкпоинте не обязательно,
widthMedia обязательно.

[
	{
		bp: 'lg', width: 400,
		webp: [img400webp, img800webp, img1200webp],
		avif: [img400avif, img800avif, img1200avif],
		jpeg: [img400jpg, img800jpg, img1200jpg],
	},
	{
		bp: 'qwerty', widthMedia: '768px', width: 200,
		avif: [img200avif, img400avif, img600avif],
		webp: [img200webp, img400webp, img600webp],
		jpeg: [img200jpg, img400jpg, img600jpg],
	},
	{
		bp: 'md', width: 300,
		jpeg: [img300jpg, img600jpg, img900jpg],
		avif: [img300avif, img600avif, img900avif],
		webp: [img300webp, img600webp, img900webp],
	}
]

4) Нельзя не добавлять картинки для определенного формата
вот так:

{
		bp: 'sm', width: 200,
		avif: [img200avif, img400avif, img600avif],
		jpeg: [img200jpg, img400jpg, img600jpg],
},

ошибки не будет, но компонент будет работать не правильно.

5) Нельзя пропускать картинки в массиве в определенном формате,
иначе атрибут srcset для <source> элемента будет
отрендерен не желательным образом.

Не правильно:
{
		bp: 'sm', width: 200,
		avif: [img200avif, img600avif],
		webp: [img200webp, img400webp, img600webp],
		jpeg: [img200jpg, img400jpg, img600jpg],
},

srcset="/static/media/testimg-size-200.cdb3def1b5b52fc1731a.avif 1x, /static/media/testimg-size-600.c646720dadf76e6858fd.avif 2x"

Правильно:

{
		bp: 'sm', width: 200,
		avif: [img200avif, img400avif, img600avif],
		webp: [img200webp, img400webp, img600webp],
		jpeg: [img200jpg, img400jpg, img600jpg],
},

srcset="/static/media/testimg-size-200.cdb3def1b5b52fc1731a.avif 1x, /static/media/testimg-size-400.0d0cc0f5adf70f7601f6.avif 2x, /static/media/testimg-size-600.c646720dadf76e6858fd.avif 3x"

6) Браузеры загужают первый подходящий <source> элемент. Если это webp,
то он будет загружен. Поэтому нужно формировать их в порядке avif -> webp -> jpeg.
Если поместить на 1-е место <source> элемент без media, то браузер
будет загружать картинки только из него.
<source
	type="image/avif"
	media="(min-width: 1440px)"
	srcset={`${img400avif} 1x,
			${img800avif} 2x,
			${img1200avif} 3x`}
/>
<source
	type="image/avif"
	srcset={`${img300avif} 1x, 
			${img600avif} 2x,
			${img900avif} 3x`}
/>
<source
	type="image/webp"
	media="(min-width: 1440px)"
	srcset={`${img400webp} 1x,
			${img800webp} 2x,
			${img1200webp} 3x`}
/>
<source
	type="image/webp"
	srcset={`${img300webp} 1x,
			${img600webp} 2x,
			${img900webp} 3x`}
/>    
*/